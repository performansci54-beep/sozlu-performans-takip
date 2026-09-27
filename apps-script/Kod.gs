/**
 * Sözlü & Performans Not Takip — Google Apps Script köprüsü
 * =========================================================
 * Bu kod, "sozlu-performans.html" uygulamasını Google Sheet'inize bağlar.
 *
 * Sheet'te olması gereken 2 sekme (yoksa ilk çalıştırmada kurEt() ile oluşturulur):
 *
 *   "Ogrenciler"  ->  A: Sınıf | B: No | C: Ad Soyad     (öğrenci listesi — SİZ doldurursunuz)
 *   "Notlar"      ->  A: Tarih | B: Sınıf | C: No | D: Ad Soyad | E: Kategori | F: Not | G: Gerekçe | H: Öğretmen
 *                     (girdiğiniz notlar buraya otomatik eklenir)
 *
 * İsteğe bağlı 3. sekme:
 *   "Kategoriler" ->  A sütununda her satıra bir kategori (uygulamadaki kategorileri buradan yönetebilirsiniz)
 *
 * Kurulum adımları için depodaki KURULUM.md dosyasına bakın.
 */

var OGRENCI_SAYFA   = "Ogrenciler";
var NOT_SAYFA       = "Notlar";
var KATEGORI_SAYFA  = "Kategoriler";

var NOT_BASLIKLARI = ["Tarih", "Sınıf", "No", "Ad Soyad", "Kategori", "Not", "Gerekçe", "Öğretmen"];

/**
 * Bir defalık kurulum: eksik sekmeleri ve başlıkları oluşturur.
 * Apps Script editöründe bu fonksiyonu bir kez çalıştırın (Run > kurEt).
 */
function kurEt() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var og = ss.getSheetByName(OGRENCI_SAYFA);
  if (!og) {
    og = ss.insertSheet(OGRENCI_SAYFA);
    og.getRange(1, 1, 1, 3).setValues([["Sınıf", "No", "Ad Soyad"]]).setFontWeight("bold");
    og.getRange(2, 1, 3, 3).setValues([
      ["5-A", "101", "Örnek Öğrenci 1"],
      ["5-A", "102", "Örnek Öğrenci 2"],
      ["6-B", "201", "Örnek Öğrenci 3"]
    ]);
    og.setFrozenRows(1);
  }

  var nt = ss.getSheetByName(NOT_SAYFA);
  if (!nt) {
    nt = ss.insertSheet(NOT_SAYFA);
    nt.getRange(1, 1, 1, NOT_BASLIKLARI.length).setValues([NOT_BASLIKLARI]).setFontWeight("bold");
    nt.setFrozenRows(1);
  }

  SpreadsheetApp.getUi
    ? SpreadsheetApp.getActiveSpreadsheet().toast("Kurulum tamam. Şimdi Dağıt (Deploy) > Web App yapın.", "Hazır", 6)
    : null;
}

/**
 * GET istekleri: roster (öğrenci listesi), history (öğrenci geçmişi), ping (test).
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "roster";
  try {
    if (action === "ping") {
      return _json({ ok: true, count: _rosterAl().length });
    }
    if (action === "roster") {
      return _json({ ok: true, roster: _rosterAl(), categories: _kategorilerAl() });
    }
    if (action === "history") {
      var sinif = e.parameter.sinif || "";
      var no = e.parameter.no || "";
      var limit = parseInt(e.parameter.limit || "5", 10);
      return _json({ ok: true, notlar: _gecmisAl(sinif, no, limit) });
    }
    return _json({ ok: false, error: "Bilinmeyen action: " + action });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/**
 * POST istekleri: yeni not kaydı ekler.
 * Beklenen JSON: { sinif, ogrenciNo, ogrenci, kategori, not, gerekce, ogretmen }
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var data = JSON.parse(e.postData.contents);

    // Öğrenci listesini içe aktarma (e-Okul'dan)
    if (data.action === "setRoster") {
      return _rosterYaz(data.roster || [], data.mode || "replace");
    }

    if (!data.ogrenci || !data.kategori) {
      return _json({ ok: false, error: "Eksik alan (öğrenci veya kategori)" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(NOT_SAYFA);
    if (!sheet) {
      sheet = ss.insertSheet(NOT_SAYFA);
      sheet.getRange(1, 1, 1, NOT_BASLIKLARI.length).setValues([NOT_BASLIKLARI]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var tarih = Utilities.formatDate(new Date(), _tz(), "yyyy-MM-dd HH:mm");
    sheet.appendRow([
      tarih,
      data.sinif || "",
      data.ogrenciNo || "",
      data.ogrenci || "",
      data.kategori || "",
      data.not === undefined ? "" : data.not,
      data.gerekce || "",
      data.ogretmen || ""
    ]);

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ----------------- Yardımcılar ----------------- */

function _tz() {
  try { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || "Europe/Istanbul"; }
  catch (e) { return "Europe/Istanbul"; }
}

function _rosterAl() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(OGRENCI_SAYFA);
  if (!sheet) return [];
  var son = sheet.getLastRow();
  if (son < 2) return [];
  var vals = sheet.getRange(2, 1, son - 1, 3).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    var sinif = String(vals[i][0]).trim();
    var no = String(vals[i][1]).trim();
    var ad = String(vals[i][2]).trim();
    if (sinif && ad) out.push({ sinif: sinif, no: no, ad: ad });
  }
  return out;
}

function _kategorilerAl() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(KATEGORI_SAYFA);
  if (!sheet) return null; // uygulama kendi varsayılanını kullanır
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(NOT_SAYFA);
  if (!sheet) return [];
  var son = sheet.getLastRow();
  if (son < 2) return [];
  var vals = sheet.getRange(2, 1, son - 1, NOT_BASLIKLARI.length).getValues();
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

/**
 * Öğrenci listesini yazar.
 * mode "replace": Ogrenciler sekmesindeki tüm veriyi bu listeyle değiştirir.
 * mode "merge":   (sinif, no) anahtarına göre ekler/günceller, diğerlerini korur.
 * roster: [{sinif, no, ad}]
 */
function _rosterYaz(roster, mode) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(OGRENCI_SAYFA);
  if (!sheet) {
    sheet = ss.insertSheet(OGRENCI_SAYFA);
    sheet.getRange(1, 1, 1, 3).setValues([["Sınıf", "No", "Ad Soyad"]]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var temiz = [];
  for (var i = 0; i < roster.length; i++) {
    var s = String(roster[i].sinif || "").trim();
    var n = String(roster[i].no || "").trim();
    var a = String(roster[i].ad || "").trim();
    if (s && a) temiz.push([s, n, a]);
  }

  if (mode === "merge") {
    var mevcut = _rosterAl(); // [{sinif,no,ad}]
    var harita = {};
    var sira = [];
    function anahtar(sinif, no) { return sinif + "||" + no; }
    mevcut.forEach(function (r) {
      var k = anahtar(r.sinif, r.no);
      if (!(k in harita)) sira.push(k);
      harita[k] = [r.sinif, r.no, r.ad];
    });
    temiz.forEach(function (row) {
      var k = anahtar(row[0], row[1]);
      if (!(k in harita)) sira.push(k);
      harita[k] = row;
    });
    temiz = sira.map(function (k) { return harita[k]; });
  }

  // Eski veri satırlarını temizle (başlık hariç)
  var son = sheet.getLastRow();
  if (son > 1) sheet.getRange(2, 1, son - 1, 3).clearContent();

  if (temiz.length) {
    sheet.getRange(2, 1, temiz.length, 3).setValues(temiz);
  }
  return _json({ ok: true, yazilan: temiz.length });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
