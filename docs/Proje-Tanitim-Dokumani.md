# Proje Tanıtımı

## Kısaca

`görev-api`, günlük işlerimi ve okul projelerimi tek yerden takip etmek için
yazdığım bir REST API. Node.js ve Express kullandım. Verileri JSON dosyasında
tutuyorum çünkü bu boyuttaki bir proje için veritabanı kurmak istemedim.

## Neden böyle bir şey yaptım

Genelde görevlerimi not defterine ve telefonun not uygulamasına dağınık şekilde
yazıyordum, hangisinin ne zaman biteceğini takip edemiyordum. Hem backend
pratiği olsun hem de işime yarasın diye kendim için bir API yazdım. Elimdeki
görevleri `data/tasks.json` içine koydum, gerisini uçlar üzerinden yönetiyorum.

## Senaryo

Bir görev şu bilgilerle tutuluyor: başlık, açıklama, durum, öncelik, kime
atandığı, hangi projeye ait olduğu ve bitiş tarihi. Durum üç değerden biri
olabiliyor: `todo`, `in-progress`, `completed`. Öncelik de `low`, `medium`,
`high`.

Örnek olarak elimde şu an "bitirme projesi sunumu", "React sepet hatasını
düzelt", "staj başvuruları" gibi kayıtlar var. Proje alanını `bitirme`, `odev`,
`kariyer`, `portfolyo` gibi ayırdım; böylece hangi iş hangi tarafa ait,
filtreleyerek görebiliyorum.

## Neler yapıyor

Görev tarafında beş temel işlem var: ekleme, listeleme, tek görev getirme,
güncelleme ve silme. Listelerken duruma, önceliğe, kişiye ve projeye göre
filtreleyebiliyorum. Başlık ve açıklama içinde arama yapabiliyorum, sıralama ve
sayfalama var.

Her istek `logger` middleware'inden geçiyor. Metot, adres, durum kodu ve geçen
süre hem konsola hem `logs/access.log` dosyasına yazılıyor. Bir istek bozuk
gelirse `validation` middleware'i 400 dönüyor ve hangi alanın yanlış olduğunu
söylüyor.

Rapor tarafında üç uç var: tamamlanan görevler, bekleyen görevler ve genel özet.
Özet ucu durum/öncelik dağılımını ve görev atanan kişileri veriyor.

## Nasıl kurguladım

Kod tek dosyada toplanmasın diye katmanlara ayırdım. Rotalar isteği controller'a
veriyor, controller service'i çağırıyor, service de JSON dosyasıyla konuşuyor.
Middleware'ler ayrı duruyor. Hata yakalama tek yerde: controller içinde
try/catch yazmıyorum, `asyncHandler` hatayı merkezi error handler'a taşıyor.

## Bilerek yapmadıklarım

- Kimlik doğrulama yok. Tek kişi kullandığı için gerek duymadım.
- Kullanıcı ve proje ayrı tablo değil; `assignee` ve `project` düz metin.
- Veritabanı yok, JSON dosyası var. Aynı anda birden fazla sunucu aynı dosyaya
  yazarsa kuyruk yetmez; tek process için tasarladım.
