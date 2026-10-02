/**
 * Sözlü & Performans Not Takip — Google Apps Script köprüsü (sınıf-sekmeli sürüm)
 * =============================================================================
 * Bu kod, "sozlu-performans.html" uygulamasını Google Sheet'inize bağlar.
 *
 * VERİ MODELİ
 * -----------
 * • Her SINIF ayrı bir SEKME olur (sekme adı = sınıf kodu: "9A", "10C" ...).
 *     A sütunu: No | B sütunu: Ad Soyad | C, D, E ...: not sütunları
 *     Not sütunları kategoriye göre gruplu ve numaralıdır: "Sözlü-1", "Sözlü-2",
 *     "Performans-1", "Ödev-1" ... Aynı kategoriye yeni not gelince, o öğrencinin
 *     o kategorideki ilk boş sütununa yazılır; boş yoksa yanına yeni numaralı
 *     sütun açılır.
 * • Her not, ilgili hücreye "hücre notu" (yorum) olarak da gerekçesiyle eklenir.
 * • Tüm girişler ayrıca "Gerekçeler" sekmesine loglanır (yayımlamadığınız sekme):
 *     Tarih | Sınıf | No | Ad Soyad | Kategori | Not | Gerekçe | Öğretmen
 * • İsteğe bağlı "Kategoriler" sekmesi: A sütununda her satıra bir kategori
 *   yazarsanız uygulama kategorileri buradan alır.
 *
 * Kurulum adımları için depodaki KURULUM.md dosyasına bakın.
 */

var SURUM          = "2026-10-02 • frozen0"; // dağıtılan kodu doğrulamak için (ping yanıtında görünür)
var LOG_SAYFA      = "Gerekçeler";
var KATEGORI_SAYFA = "Kategoriler";
var LOG_BASLIKLARI = ["Tarih", "Sınıf", "No", "Ad Soyad", "Kategori", "Not", "Gerekçe", "Öğretmen"];
// Sınıf sekmesi olarak SAYILMAYAN (ayrılmış) sekme adları:
var AYRILMIS = [LOG_SAYFA, KATEGORI_SAYFA, "Ozet", "Özet", "Ayarlar"];

/**
 * Bir defalık kurulum: "Gerekçeler" log sekmesini oluşturur.
 * Apps Script editöründe bir kez çalıştırın (Run > kurEt).
 * Sınıf sekmeleri, uygulamadan içe aktarma yapıldığında otomatik oluşur.
 */
function kurEt() {
  _logSayfasi();
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Kurulum tamam. Şimdi Dağıt (Deploy) > Web App yapın, sonra uygulamadan sınıflarınızı aktarın.",
      "Hazır", 6);
  } catch (e) {}
}

/* ============================ GET ============================ */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "roster";
  try {
    if (action === "ping")   return _json({ ok: true, count: _rosterAl().length, surum: SURUM });
    if (action === "roster") return _json({ ok: true, roster: _rosterAl(), categories: _kategorilerAl() });
    if (action === "history") {
      var limit = parseInt(e.parameter.limit || "5", 10);
      return _json({ ok: true, notlar: _gecmisAl(e.parameter.sinif || "", e.parameter.no || "", limit) });
    }
    return _json({ ok: false, error: "Bilinmeyen action: " + action });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/* ============================ POST ============================ */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var data = JSON.parse(e.postData.contents);

    if (data.action === "setRoster") {
      return _rosterYaz(data.roster || []);
    }

    // Not kaydı
    if (!data.sinif || !data.ogrenci || !data.kategori) {
      return _json({ ok: false, error: "Eksik alan (sınıf, öğrenci veya kategori)" });
    }
    return _notYaz(data);
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ======================== Not yazma ======================== */
function _notYaz(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = _sinifSekmesi(data.sinif);

  // Öğrenci satırını bul; yoksa ekle
  var row = _ogrenciSatiri(sheet, data.ogrenciNo, data.ogrenci);
  if (row === -1) {
    sheet.appendRow([data.ogrenciNo || "", data.ogrenci || ""]);
    row = sheet.getLastRow();
  }

  // Kategori için uygun sütunu bul/oluştur
  var col = _kategoriSutunu(sheet, data.kategori, row);

  var deger = (data.not === undefined || data.not === null) ? "" : data.not;
  var num = Number(deger);
  var cell = sheet.getRange(row, col);
  cell.setValue((deger !== "" && !isNaN(num) && String(deger).trim() !== "") ? num : deger);

  // Hücre notu (gerekçe + tarih + öğretmen)
  var tarih = Utilities.formatDate(new Date(), _tz(), "yyyy-MM-dd HH:mm");
  var notParcalari = [];
  if (data.gerekce) notParcalari.push(data.gerekce);
  notParcalari.push(tarih + (data.ogretmen ? "  •  " + data.ogretmen : ""));
  cell.setNote(notParcalari.join("\n"));

  // Log sekmesine ekle
  _logSayfasi().appendRow([
    tarih, data.sinif, data.ogrenciNo || "", data.ogrenci,
    data.kategori, deger, data.gerekce || "", data.ogretmen || ""
  ]);

  return _json({ ok: true, satir: row, sutun: col });
}

/**
 * Kategoriye ait, bu öğrenci için uygun sütunu döndürür.
 * "Kategori-1", "Kategori-2" ... başlıklı sütunlar aranır; öğrencinin ilk boş
 * olanı seçilir. Hepsi doluysa (veya hiç yoksa) grubun sonuna yeni numaralı
 * sütun eklenir.
 */
function _kategoriSutunu(sheet, kategori, ogrRow) {
  var lastCol = Math.max(sheet.getLastColumn(), 2);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var re = new RegExp("^" + _regexKacir(kategori) + "-(\\d+)$");

  var catCols = [], maxN = 0, sonCatCol = -1;
  for (var c = 0; c < headers.length; c++) {
    var m = re.exec(String(headers[c]).trim());
    if (m) {
      var n = parseInt(m[1], 10);
      catCols.push({ col: c + 1, n: n });
      if (n > maxN) maxN = n;
      if (c + 1 > sonCatCol) sonCatCol = c + 1;
    }
  }
  catCols.sort(function (a, b) { return a.n - b.n; });

  // Öğrencinin bu kategorideki ilk boş sütunu
  for (var i = 0; i < catCols.length; i++) {
    var v = sheet.getRange(ogrRow, catCols[i].col).getValue();
    if (v === "" || v === null) return catCols[i].col;
  }

  // Yeni sütun aç
  var yeniBaslik = kategori + "-" + (maxN + 1);
  var hedef;
  if (sonCatCol > 0) {
    sheet.insertColumnAfter(sonCatCol);   // grubu bir arada tut
    hedef = sonCatCol + 1;
  } else {
    hedef = Math.max(sheet.getLastColumn(), 2) + 1; // yeni kategori: en sağa
  }
  sheet.getRange(1, hedef).setValue(yeniBaslik).setFontWeight("bold");
  return hedef;
}

/* ==================== Öğrenci listesi yazma ==================== */
/**
 * roster: [{sinif, no, ad}]  — her sınıf kendi sekmesine yazılır.
 * Öğrenciler No'ya göre eklenir/güncellenir; mevcut notlar KORUNUR (silinmez).
 */
function _rosterYaz(roster) {
  // sınıfa göre grupla
  var gruplar = {};
  for (var i = 0; i < roster.length; i++) {
    var s = String(roster[i].sinif || "").trim();
    var no = String(roster[i].no || "").trim();
    var ad = String(roster[i].ad || "").trim();
    if (!s || !ad) continue;
    (gruplar[s] || (gruplar[s] = [])).push({ no: no, ad: ad });
  }

  var toplam = 0, sinifSayisi = 0;
  for (var sinif in gruplar) {
    if (!gruplar.hasOwnProperty(sinif)) continue;
    sinifSayisi++;
    var sheet = _sinifSekmesi(sinif);

    // Mevcut No -> satır haritası
    var last = sheet.getLastRow();
    var mevcut = {};
    if (last >= 2) {
      var vals = sheet.getRange(2, 1, last - 1, 2).getValues();
      for (var r = 0; r < vals.length; r++) {
        var k = String(vals[r][0]).trim();
        if (k) mevcut[k] = { row: r + 2, ad: String(vals[r][1]).trim() };
      }
    }

    var eklenecek = [];
    gruplar[sinif].forEach(function (o) {
      if (o.no && mevcut[o.no]) {
        if (o.ad && o.ad !== mevcut[o.no].ad) {
          sheet.getRange(mevcut[o.no].row, 2).setValue(o.ad); // ad güncelle
        }
      } else {
        eklenecek.push([o.no, o.ad]);
      }
      toplam++;
    });

    if (eklenecek.length) {
      var basla = Math.max(sheet.getLastRow(), 1) + 1;
      sheet.getRange(basla, 1, eklenecek.length, 2).setValues(eklenecek);
    }
    _sekmeBicimle(sheet);
  }

  return _json({ ok: true, yazilan: toplam, sinif: sinifSayisi });
}

/* ========================= Yardımcılar ========================= */
function _tz() {
  try { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || "Europe/Istanbul"; }
  catch (e) { return "Europe/Istanbul"; }
}

function _ayrilmisMi(ad) {
  for (var i = 0; i < AYRILMIS.length; i++) if (AYRILMIS[i] === ad) return true;
  return false;
}

// Bir sekme sınıf sekmesi mi? (A1 = "No", B1 = "Ad Soyad")
function _sinifSekmesiMi(sheet) {
  if (_ayrilmisMi(sheet.getName())) return false;
  if (sheet.getLastColumn() < 2) return false;
  var h = sheet.getRange(1, 1, 1, 2).getValues()[0];
  return String(h[0]).trim() === "No" && String(h[1]).trim() === "Ad Soyad";
}

function _sinifSekmesi(sinif) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sinif);
  if (!sheet) {
    sheet = ss.insertSheet(sinif);
  }
  // Başlık garanti
  var h = sheet.getRange(1, 1, 1, 2).getValues()[0];
  if (String(h[0]).trim() !== "No" || String(h[1]).trim() !== "Ad Soyad") {
    sheet.getRange(1, 1, 1, 2).setValues([["No", "Ad Soyad"]]);
  }
  _sekmeBicimle(sheet);
  return sheet;
}

function _sekmeBicimle(sheet) {
  try {
    sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 2)).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(0); // sütun dondurma YOK — "Web'de yayımla"da sağ tarafı gizleyebiliyor
  } catch (e) {}
}

function _ogrenciSatiri(sheet, no, ad) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var vals = sheet.getRange(2, 1, last - 1, 2).getValues();
  var noS = String(no || "").trim();
  if (noS) {
    for (var i = 0; i < vals.length; i++) {
      if (String(vals[i][0]).trim() === noS) return i + 2;
    }
  }
  var adS = String(ad || "").trim();
  if (adS) {
    for (var j = 0; j < vals.length; j++) {
      if (String(vals[j][1]).trim() === adS) return j + 2;
    }
  }
  return -1;
}

function _logSayfasi() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LOG_SAYFA);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SAYFA);
    sheet.getRange(1, 1, 1, LOG_BASLIKLARI.length).setValues([LOG_BASLIKLARI]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function _rosterAl() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var out = [];
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    if (!_sinifSekmesiMi(sheet)) continue;
    var sinif = sheet.getName();
    var last = sheet.getLastRow();
    if (last < 2) continue;
    var vals = sheet.getRange(2, 1, last - 1, 2).getValues();
    for (var i = 0; i < vals.length; i++) {
      var no = String(vals[i][0]).trim();
      var ad = String(vals[i][1]).trim();
      if (ad) out.push({ sinif: sinif, no: no, ad: ad });
    }
  }
  return out;
}

function _kategorilerAl() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(KATEGORI_SAYFA);
  if (!sheet) return null;
  var son = sheet.getLastRow();
  if (son < 1) return null;
  var vals = sheet.getRange(1, 1, son, 1).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    var v = String(vals[i][0]).trim();
    if (v && v.toLowerCase() !== "kategori" && v.toLowerCase() !== "kategoriler") out.push(v);
  }
  return out.length ? out : null;
}

function _gecmisAl(sinif, no, limit) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SAYFA);
  if (!sheet) return [];
  var son = sheet.getLastRow();
  if (son < 2) return [];
  var vals = sheet.getRange(2, 1, son - 1, LOG_BASLIKLARI.length).getValues();
  var out = [];
  for (var i = vals.length - 1; i >= 0; i--) {
    var r = vals[i];
    if (String(r[1]).trim() === String(sinif).trim() && String(r[2]).trim() === String(no).trim()) {
      out.push({ tarih: r[0], kategori: r[4], not: r[5], gerekce: r[6] });
      if (out.length >= limit) break;
    }
  }
  return out;
}

function _regexKacir(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * TEK SEFERLİK: Tüm sekmelerdeki "dondurulmuş sütun" çizgisini kaldırır.
 * Apps Script editöründe fonksiyon listesinden `cizgileriKaldir` seçip
 * Çalıştır (Run) deyin. Dağıtım (deploy) gerekmez, anında etki eder.
 */
function cizgileriKaldir() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sayac = 0;
  for (var i = 0; i < sheets.length; i++) {
    try {
      if (sheets[i].getFrozenColumns() > 0) { sheets[i].setFrozenColumns(0); sayac++; }
    } catch (e) {}
  }
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      sayac + " sekmedeki sütun çizgisi kaldırıldı.", "Tamam", 6);
  } catch (e) {}
  return sayac;
}
