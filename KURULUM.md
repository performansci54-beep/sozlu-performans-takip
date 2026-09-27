# Sözlü & Performans Not Takip — Kurulum Kılavuzu

Bu araç iki parçadan oluşur:

1. **`sozlu-performans.html`** — Not girdiğiniz uygulama (telefon/tablet/bilgisayarda çalışır).
2. **Google Sheet + Apps Script** — Notların kaydedildiği tablo ve bağlantı köprüsü (`apps-script/Kod.gs`).

Akış: **Sınıf seç → öğrenci listesi açılır → öğrenci seç → kategori seç → not + gerekçe gir → Kaydet.**

Her sınıf, Google Sheet'te **kendi sekmesinde** tutulur (sekme adı = sınıf kodu: `9A`, `10C`…). Öğrenciler bu sekmede hazır listelidir; girdiğiniz not, ilgili öğrencinin satırında **kategoriye ait sütuna** (`Sözlü-1`, `Sözlü-2`, `Performans-1`…) yazılır. Gerekçe hem **hücre notu** olarak eklenir hem de ayrı bir **`Gerekçeler`** sekmesine loglanır. Böylece her sınıf sayfasını ayrı yayımlayabilirsiniz.

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

### Adım 3: İzinleri verin (kurulum)
1. Apps Script editöründe, üstteki fonksiyon listesinden **`kurEt`** seçin ve **Çalıştır (Run)**'a basın.
2. İlk çalıştırmada Google izin isteyecek: **İzinleri gözden geçir → hesabınızı seçin → Gelişmiş → (proje adına) git → İzin ver**.
3. Bu, tablonuza **`Gerekçeler`** log sekmesini ekler. **Sınıf sekmeleri** (9A, 10C…) daha sonra uygulamadan içe aktarma yapınca otomatik oluşur.

### Adım 4: Öğrenci listesini doldurun
İki yol var:

**A) e-Okul'dan otomatik aktarma (önerilir).** Aşağıdaki "Öğrenci listesini e-Okul'dan aktarma" bölümüne bakın. Sınıf sekmeleri ve öğrenci listeleri otomatik oluşur.

**B) Elle girme.** Her sınıf için bir sekme açın (sekme adı = sınıf kodu, ör. `9A`). İlk satıra başlıkları, altına öğrencileri yazın:

| No  | Ad Soyad         |
|-----|------------------|
| 37  | Beren Nil Özalıç |
| 46  | Gülcan Arslan    |

> Önemli: Sınıf sekmesinin **A1 hücresi tam olarak `No`**, **B1 hücresi tam olarak `Ad Soyad`** olmalı (uygulama sınıf sekmelerini bu başlıktan tanır). Not sütunlarını (C, D…) siz açmayın; not girdikçe otomatik oluşur.

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

Artık: sınıf seçin → öğrenci seçin → kategori seçin → not ve gerekçe girin → **Kaydet**. Kayıt anında ilgili **sınıf sekmesinde** öğrencinin karşısındaki kategori sütununa yazılır (gerekçe hücre notu olarak eklenir) ve seçili öğrencinin son notları uygulamada görünür.

---

## Uygulamayı nasıl yayınlarım / açarım?

Üç seçenek:

- **En basit:** `sozlu-performans.html` dosyasını bilgisayarınıza indirip çift tıklayın. Ayarlar tarayıcıda saklanır.
- **GitHub Pages (bu depo):** Repo **Settings → Pages → Branch: `main` → Save**. Birkaç dakika sonra:
  `https://<kullanıcı-adınız>.github.io/sozlu-performans-takip/sozlu-performans.html`
- **Telefonda kısayol:** Yukarıdaki adresi telefon tarayıcısında açıp "Ana ekrana ekle" derseniz uygulama gibi çalışır.

---

## Öğrenci listesini e-Okul'dan aktarma (ve güncel tutma)

Öğrenci listeniz değiştikçe elle uğraşmayın; doğrudan e-Okul çıktısından aktarın:

1. **e-Okul → Sınıf İşlemleri → Sınıf Listesi** (veya "Öğrenci Listesi") raporunu alın ve **Excel (.xls)** olarak indirin. Bu dosyada okulun tüm sınıfları olabilir — sorun değil.
2. Uygulamada **⚙️ Ayarlar → "📥 Öğrenci listesini e-Okul'dan aktar"** bölümünde dosyayı seçin.
3. Uygulama dosyadaki tüm sınıfları (ör. 9A, 9C, 10E…) öğrenci sayılarıyla listeler.
4. **Sadece size ait sınıfları işaretleyin.** Seçiminiz hatırlanır; bir dahaki güncellemede otomatik işaretli gelir.
5. **"Seçili sınıfları aktar"** deyin. Her sınıf, Google Sheet'te **kendi sekmesi** olarak oluşturulur ve öğrenciler yazılır.

**Güncelleme:** Liste değişince (yeni kayıt, nakil vb.) e-Okul'dan yeni `.xls`'i indirip aynı adımları tekrarlayın. Öğrenciler **eklenir/güncellenir**, **mevcut notlar korunur** (hiçbir not silinmez). Ayrılan bir öğrenciyi listeden çıkarmak isterseniz, ilgili sınıf sekmesinden o satırı elle silebilirsiniz.

> Desteklenen format: e-Okul "Sınıf Listesi" (.xls) — başlığında "… X. Sınıf / Y Şubesi … Sınıf Listesi" geçen, S.No / Öğrenci No / Adı / Soyadı sütunlu çıktı. Sınıf kodu otomatik "9A", "10C" gibi üretilir.

---

## Sınıf sekmeleri ve not düzeni

Her sınıfın kendi sekmesi vardır. Örnek `9A` sekmesi:

| No | Ad Soyad         | Sözlü-1 | Sözlü-2 | Performans-1 | Ödev-1 |
|----|------------------|---------|---------|--------------|--------|
| 37 | Beren Nil Özalıç |   85    |   90    |      80      |  100   |
| 46 | Gülcan Arslan    |   70    |         |      95      |        |

- Bir öğrenciye aynı kategoriden ikinci not girince, o kategorinin **yanına** yeni sütun açılır (`Sözlü-2`), böylece kategoriler gruplu kalır.
- Her not hücresinin üstüne gelince **gerekçe + tarih** görünür (hücre notu).
- Tüm girişler ayrıca **`Gerekçeler`** sekmesine tarih/kategori/gerekçeyle loglanır — bu sekmeyi yayımlamayın.

### Bir sınıfın sayfasını ayrı yayımlama
Her sınıfı ayrı yayımlayabilirsiniz:
1. **Dosya → Paylaş → Web'de yayımla (Publish to web)**.
2. Açılan pencerede **"Tüm belge"** yerine ilgili **sekmeyi (ör. 9A)** seçin.
3. **Yayımla** → o sınıfa özel bir bağlantı alırsınız. Her sınıf için tekrarlayın.

> Alternatif: Sekmeye sağ tıklayıp diğer sekmeleri "Gizle" diyerek yalnızca ilgili sınıfı paylaşabilir; ya da her sınıf için ayrı bir Sheet dosyası tutabilirsiniz. Web'de yayımlama en pratik yoldur.

---

## Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|-------|-------|
| "Bağlantı yok — demo listesi" | Ayarlara Web App URL girilmemiş ya da yanlış. Adresin `/exec` ile bittiğinden emin olun. |
| Test "✗ Ulaşılamadı" | Dağıtımda **Erişim: Herkes** seçili mi? Kodu değiştirdiyseniz **yeni sürüm** dağıttınız mı? |
| Sınıf listesi boş | Sınıflarınızı e-Okul'dan aktardınız mı? (Ayarlar → içe aktarma) Sonra **🔄 Listeyi yenile**'ye basın. Sınıf sekmelerinin A1=`No`, B1=`Ad Soyad` olduğundan emin olun. |
| Kayıt "kuyruğa alındı" | İnternet kesikti; bağlantı gelince otomatik gönderilir. Uygulamayı açık tutun. |
| Kategorileri değiştirmek | Ayarlar → "Kategoriler" kutusundan, ya da Sheet'e **Kategoriler** sekmesi ekleyip A sütununa yazarak. |

---

## Gizlilik notu

Web App **"Herkes"** erişimiyle yayınlanır; yani adresi bilen herkes veri **gönderebilir/okuyabilir**. Adresi paylaşmayın. Daha sıkı erişim isterseniz, kurumsal Google hesabınızda erişimi *"Kurumunuzdaki herkes"* olarak da seçebilirsiniz (o zaman uygulamayı da giriş yapmış olarak kullanmanız gerekir).
