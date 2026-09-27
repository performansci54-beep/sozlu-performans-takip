# Sözlü & Performans Not Takip

Öğrencilerin sözlü ve performans notlarını hızlıca girmek için basit bir araç.
**Sınıf seç → öğrenci listesi açılır → kategori seç → not + gerekçe gir → Kaydet.**
Her kayıt, tarih ve gerekçesiyle Google Sheet'e düşer.

## Dosyalar
- **`sozlu-performans.html`** — Not girişi uygulaması (telefon/tablet/bilgisayar uyumlu, çevrimdışı kuyruk destekli).
- **`apps-script/Kod.gs`** — Google Sheet'e bağlanan Apps Script köprüsü.
- **`KURULUM.md`** — Adım adım kurulum kılavuzu.

## Öne çıkan özellikler
- Her sınıf **kendi sekmesinde**; notlar öğrencinin karşısındaki **kategori sütununa** (Sözlü-1, Sözlü-2…) yazılır. Her sınıf sayfasını ayrı yayımlayabilirsiniz.
- Gerekçe hem **hücre notu** olarak eklenir hem de ayrı `Gerekçeler` sekmesine loglanır.
- Seçilen öğrencinin son notları uygulamada görünür.
- **e-Okul "Sınıf Listesi" (.xls)** dosyasından, **yalnızca kendi sınıflarınızı** seçip öğrenci listesini içe aktarma ve güncel tutma.
- İnternet kesilirse kayıtlar kuyruğa alınır, bağlantı gelince otomatik gönderilir.

## Hızlı başlangıç
1. `KURULUM.md` içindeki adımlarla Google Sheet + Apps Script'i kurun.
2. `sozlu-performans.html`'i açın, **⚙️ Ayarlar**'dan bağlantı adresini girin ve e-Okul listenizi aktarın.

### GitHub Pages ile yayınlama
Repo **Settings → Pages → Branch: main → Save**. Ardından uygulama şu adresten açılır:
`https://<kullanıcı-adınız>.github.io/sozlu-performans-takip/sozlu-performans.html`
