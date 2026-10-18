# görev-api

Kendi işlerimi takip etmek için yazdığım küçük bir görev API'si. Node.js ve Express
kullandım, verileri JSON dosyasında tutuyorum. Veritabanı kurmak istemedim.

## Neler var

- Görev ekleme, listeleme, detay, güncelleme, silme
- Her isteği konsola ve `logs/access.log` dosyasına yazan logger
- Alan doğrulama: `title` ve `assignee` zorunlu, `priority` ve `status` belli değerlerden biri
- Durum, öncelik, kişi ve projeye göre filtreleme
- Başlık/açıklamada arama, sıralama, sayfalama
- Tamamlanan / bekleyen / genel özet için üç rapor ucu

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
npm start
```

Sunucu `http://localhost:3000` adresinde açılır. Port değiştirmek istersen:

```bash
# PowerShell
$env:PORT=4000; npm start
```

Geliştirirken `npm run dev` kullanıyorum; dosya değişince sunucu kendini yeniliyor.

## Uçlar

| Metot | Yol | Ne yapıyor |
|---|---|---|
| GET | `/api/health` | Sunucu ayakta mı |
| GET | `/api/tasks` | Görevleri listeler |
| POST | `/api/tasks` | Yeni görev ekler |
| GET | `/api/tasks/:id` | Tek görev getirir |
| PUT | `/api/tasks/:id` | Görevi günceller |
| DELETE | `/api/tasks/:id` | Görevi siler |
| GET | `/api/tasks/search?keyword=` | Başlık/açıklamada arar |
| GET | `/api/tasks/assignee/:assignee` | Kişiye atanan görevler |
| GET | `/api/reports/completed` | Tamamlananlar |
| GET | `/api/reports/pending` | Bekleyenler |
| GET | `/api/reports/summary` | Genel özet |

Listeleme şu parametreleri alıyor: `status`, `priority`, `assignee`, `project`,
`keyword`, `sort`, `page`, `limit`. Örnek:

```
GET /api/tasks?status=todo&sort=-createdAt&page=1&limit=10
```

`sort` için `createdAt`, `updatedAt`, `priority`, `title`, `dueDate`, `id`
kullanılabilir. Azalan sıralama için başına `-` koyuyorum (`sort=-createdAt`).

## Örnek

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Sunum slaytlarini hazirla","priority":"high","assignee":"samil"}'
```

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

## Klasörler

```
data/tasks.json       veriler
docs/                 tanitim, veri modeli, api dokumani
postman/              postman koleksiyonu
src/config            ayarlar
src/controllers       istek/cevap
src/middleware        logger, validation, hata yakalama
src/routes            rotalar
src/services          is mantigi
src/utils             yardimci dosyalar
```

## Veri

Görevler `data/tasks.json` içinde duruyor:

```json
{
  "nextId": 9,
  "tasks": [ { "id": 1, "title": "...", "...": "..." } ]
}
```

`nextId` sayesinde silinen bir görevin numarası yeni göreve tekrar verilmiyor.
Dosyaya yazarken önce geçici dosyaya yazıp sonra üzerine taşıyorum, böylece aynı
anda gelen isteklerde yarım dosya okunmuyor. Yazma işlemleri sıraya alınıyor.

## Postman

`postman/gorev-api.postman_collection.json` dosyasını Postman'e import edip
istekleri deneyebilirsin. `baseUrl` değişkeni `http://localhost:3000` geliyor.

## Notlar

- Kimlik doğrulama yok; tek kişilik kullanım için yazdım.
- Aynı anda birden fazla sunucu aynı dosyaya yazarsa kuyruk işe yaramaz. Tek
  process için tasarladım.

Dokümanlar: [tanıtım](docs/Proje-Tanitim-Dokumani.md) ·
[veri modeli](docs/Veri-Modeli.md) · [API](docs/API-Dokumani.md)
