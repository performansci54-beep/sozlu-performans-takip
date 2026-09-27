# Sözlü & Performans Not Takip — Kurulum Kılavuzu

Bu araç iki parçadan oluşur:

1. **`sozlu-performans.html`** — Not girdiğiniz uygulama (telefon/tablet/bilgisayarda çalışır).
2. **Google Sheet + Apps Script** — Notların kaydedildiği tablo ve bağlantı köprüsü (`apps-script/Kod.gs`).

Akış: **Sınıf seç → öğrenci listesi açılır → öğrenci seç → kategori seç → not + gerekçe gir → Kaydet** → ilgili öğrencinin kaydı Google Sheet'teki **Notlar** sekmesine, tarih ve gerekçesiyle eklenir.

---

## Bölüm 1 — Google Sheet ve Apps Script kurulumu (bir defalık)

### Adım 1: Tabloyu oluşturun
1. [sheets.new](https://sheets.new) adresinden yeni bir Google Sheet açın.
2. Dosyaya bir ad verin (ör. **Sözlü-Performans Notları**).

### Adım 2: Apps Script kodunu yapıştırın
1. Sheet'te üst menüden **Uzantılar → Apps Script**'e tıklayın.
2. Açılan editördeki tüm örnek kodu silin.
3. Bu depodaki **`apps-script/Kod.gs`** dosyasının içeriğini kopyalayıp yapıştırın.
4. Kaydet (💾 / Ctrl+S).

### Adım 3: Sekmeleri oluşturun
1. Apps Script editöründe, üstteki fonksiyon listesinden **`kurEt`** seçin ve **Çalıştır (Run)**'a basın.
2. İlk çalıştırmada Google izin isteyecek: **İzinleri gözden geçir → hesabınızı seçin → Gelişmiş → (proje adına) git → İzin ver**.
3. Bu, tablonuza otomatik olarak **Ogrenciler** ve **Notlar** sekmelerini ekler.

### Adım 4: Öğrenci listesini doldurun
İki yol var:

**A) e-Okul'dan otomatik aktarma (önerilir).** Aşağıdaki "Öğrenci listesini e-Okul'dan aktarma" bölümüne bakın. Manuel yazmanıza gerek kalmaz.

**B) Elle girme.** **Ogrenciler** sekmesine öğrencilerinizi girin (örnek satırları silebilirsiniz):

| Sınıf | No  | Ad Soyad       |
|-------|-----|----------------|
| 9A    | 37  | Beren Nil Özalıç |
| 9A    | 46  | Gülcan Arslan  |
| 10C   | 12  | Ali Çelik      |

> Not: **Sınıf** ve **Ad Soyad** zorunlu, **No** isteğe bağlıdır. Sınıf adlarını istediğiniz gibi yazabilirsiniz.

### Adım 5: Web App olarak yayınlayın (Deploy)
1. Apps Script editöründe sağ üstte **Dağıt (Deploy) → Yeni dağıtım (New deployment)**.
2. Dişli ⚙️ → **Web app** türünü seçin.
3. Ayarlar:
   - **Yürüten (Execute as):** *Ben (kendi hesabım)*
   - **Erişim (Who has access):** *Herkes (Anyone)*
4. **Dağıt (Deploy)** → çıkan **Web app URL**'ini kopyalayın. Adres şuna benzer:
   `https://script.google.com/macros/s/AKfy.../exec`

> ⚠️ Kodu ileride değiştirirseniz **Dağıt → Dağıtımları yönet → (kalem simgesi) → Sürüm: Yeni → Dağıt** ile güncelleyin. Aynı URL çalışmaya devam eder.

---

## Bölüm 2 — Uygulamayı bağlayın

1. **`sozlu-performans.html`** dosyasını bir tarayıcıda açın (aşağıda yayınlama seçenekleri var).
2. Sağ üstteki **⚙️ Ayarlar**'a girin.
3. **Öğretmen adı**nızı yazın.
4. Kopyaladığınız **Web App URL**'ini "Google Apps Script bağlantı adresi" kutusuna yapıştırın.
5. **🔌 Bağlantıyı test et** → "✓ Bağlantı başarılı" görmelisiniz.
6. **Kaydet**. Sınıf listesi otomatik gelir.

Artık: sınıf seçin → öğrenci seçin → kategori seçin → not ve gerekçe girin → **Kaydet**. Kayıt anında **Notlar** sekmesine düşer ve seçili öğrencinin son notları uygulamada görünür.

---

## Uygulamayı nasıl yayınlarım / açarım?

Üç seçenek:

- **En basit:** `sozlu-performans.html` dosyasını bilgisayarınıza indirip çift tıklayın. Ayarlar tarayıcıda saklanır.
- **GitHub Pages (bu depo):** Bu dosya depoda olduğundan, GitHub Pages açıksa şu adresten erişilir:
  `https://<kullanıcı-adınız>.github.io/performansv4.2/sozlu-performans.html`
- **Telefonda kısayol:** Yukarıdaki adresi telefon tarayıcısında açıp "Ana ekrana ekle" derseniz uygulama gibi çalışır.

---

## Öğrenci listesini e-Okul'dan aktarma (ve güncel tutma)

Öğrenci listeniz değiştikçe elle uğraşmayın; doğrudan e-Okul çıktısından aktarın:

1. **e-Okul → Sınıf İşlemleri → Sınıf Listesi** (veya "Öğrenci Listesi") raporunu alın ve **Excel (.xls)** olarak indirin. Bu dosyada okulun tüm sınıfları olabilir — sorun değil.
2. Uygulamada **⚙️ Ayarlar → "📥 Öğrenci listesini e-Okul'dan aktar"** bölümünde dosyayı seçin.
3. Uygulama dosyadaki tüm sınıfları (ör. 9A, 9C, 10E…) öğrenci sayılarıyla listeler.
4. **Sadece size ait sınıfları işaretleyin.** Seçiminiz hatırlanır; bir dahaki güncellemede otomatik işaretli gelir.
5. **"Seçili sınıfları aktar"** deyin. Öğrenciler Google Sheet'teki **Ogrenciler** sekmesine yazılır.

**Güncelleme:** Liste değişince (yeni kayıt, nakil vb.) e-Okul'dan yeni `.xls`'i indirip aynı adımları tekrarlayın. "Mevcut listenin yerine yaz" işaretliyken eski liste tamamen yenisiyle değişir (ayrılan öğrenciler silinir). İşareti kaldırırsanız yeni öğrenciler eklenir, mevcutlar korunur (birleştirme).

> Desteklenen format: e-Okul "Sınıf Listesi" (.xls) — başlığında "… X. Sınıf / Y Şubesi … Sınıf Listesi" geçen, S.No / Öğrenci No / Adı / Soyadı sütunlu çıktı. Sınıf kodu otomatik "9A", "10C" gibi üretilir.

---

## Öğrenci bazında görünüm ("her öğrencinin hanesi")

**Notlar** sekmesi tüm kayıtların kaydıdır (her satır bir not). Öğrenci bazında özet için yeni bir sekme açıp (**Ozet** gibi) A1 hücresine şu formülü yazabilirsiniz:

```
=QUERY(Notlar!A:H; "select C, D, B, E, F, G, A where D is not null order by D, A desc label C 'No', D 'Ad Soyad', B 'Sınıf', E 'Kategori', F 'Not', G 'Gerekçe', A 'Tarih'"; 1)
```

Bu, tüm notları öğrenciye göre gruplu, gerekçeleriyle birlikte listeler. Tek bir öğrenciyi görmek için Sheet'in **filtre** özelliğini (Veri → Filtre oluştur) kullanabilirsiniz.

---

## Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|-------|-------|
| "Bağlantı yok — demo listesi" | Ayarlara Web App URL girilmemiş ya da yanlış. Adresin `/exec` ile bittiğinden emin olun. |
| Test "✗ Ulaşılamadı" | Dağıtımda **Erişim: Herkes** seçili mi? Kodu değiştirdiyseniz **yeni sürüm** dağıttınız mı? |
| Sınıf listesi boş | **Ogrenciler** sekmesini doldurdunuz mu? Ayarlarda **🔄 Listeyi yenile**'ye basın. |
| Kayıt "kuyruğa alındı" | İnternet kesikti; bağlantı gelince otomatik gönderilir. Uygulamayı açık tutun. |
| Kategorileri değiştirmek | Ayarlar → "Kategoriler" kutusundan, ya da Sheet'e **Kategoriler** sekmesi ekleyip A sütununa yazarak. |

---

## Gizlilik notu

Web App **"Herkes"** erişimiyle yayınlanır; yani adresi bilen herkes veri **gönderebilir/okuyabilir**. Adresi paylaşmayın. Daha sıkı erişim isterseniz, kurumsal Google hesabınızda erişimi *"Kurumunuzdaki herkes"* olarak da seçebilirsiniz (o zaman uygulamayı da giriş yapmış olarak kullanmanız gerekir).
