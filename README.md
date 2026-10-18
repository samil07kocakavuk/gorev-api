# TASKFLOW API

**Görev ve Proje Yönetim Sistemi REST API'si**

Node.js ve Express.js ile geliştirilmiş, REST API mimarisine uygun bir görev yönetim
sistemi. Bir yazılım şirketinin ekip içindeki görevlerini, projelerini ve çalışan
sorumluluklarını takip edebilmesi; görevlerin oluşturulması, atanması, durum takibi ve
önceliklendirilmesi için bir altyapı sunar.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Proje Klasör Yapısı](#proje-klasör-yapısı)
- [API Uç Noktaları](#api-uç-noktaları)
- [Görev (Task) Veri Modeli](#görev-task-veri-modeli)
- [Örnek İstekler](#örnek-istekler)
- [Postman Koleksiyonu](#postman-koleksiyonu)
- [Loglama](#loglama)
- [Dokümantasyon](#dokümantasyon)

---

## Özellikler

**Zorunlu gereksinimler**

- ✅ Görev Yönetim Modülü – tam **CRUD**: ekleme, listeleme, detay, güncelleme, silme
- ✅ **Logger middleware** – her isteğin HTTP metodu, endpoint ve zaman damgasını
  konsola ve `logs/access.log` dosyasına kaydeder
- ✅ REST API mimarisine uygun **routing** yapısı
- ✅ Sunucu yeniden başlasa bile verileri koruyan **JSON dosya tabanlı** kalıcı depolama
- ✅ Merkezi **hata yönetimi** (error handler)

**İsteğe bağlı (ileri seviye) özellikler**

- Duruma göre filtreleme → `GET /api/tasks?status=completed`
- Önceliğe göre filtreleme → `GET /api/tasks?priority=high`
- Görev arama → `GET /api/tasks/search?keyword=backend`
- Kullanıcı bazlı listeleme → `GET /api/tasks/assignee/musa`
- Sayfalama → `GET /api/tasks?page=1&limit=10`
- Sıralama → `GET /api/tasks?sort=-createdAt`
- **Validation middleware** – `title`, `description`, `priority`, `assignee` doğrulaması;
  geçersiz veride `400 Bad Request` ve açıklayıcı mesaj
- **Raporlama servisleri** → `/api/reports/completed`, `/api/reports/pending`, `/api/reports/summary`

---

## Kullanılan Teknolojiler

| Teknoloji | Amaç |
|---|---|
| Node.js (>= 18) | Çalışma ortamı |
| Express.js 4 | Web framework / routing |
| CORS | Frontend uygulamalarından erişim |
| JSON dosyası | Kalıcı veri saklama (harici veritabanı gerekmez) |

---

## Kurulum

Projeyi bilgisayarınıza indirdikten sonra terminalde proje klasörüne gidin:

```bash
cd TaskFlow-API
```

Bağımlılıkları kurun:

```bash
npm install
```

---

## Çalıştırma

**Normal başlatma:**

```bash
npm start
```

**Geliştirme modu (dosya değişince otomatik yeniden başlar, Node 18+):**

```bash
npm run dev
```

Sunucu varsayılan olarak **http://localhost:3000** adresinde çalışır.
Çalıştığını doğrulamak için tarayıcıdan veya Postman'den şu adrese istek atın:

```
GET http://localhost:3000/api/health
```

Port değiştirmek için:

```bash
# Windows (PowerShell)
$env:PORT=4000; npm start

# macOS / Linux
PORT=4000 npm start
```

---

## Proje Klasör Yapısı

```
TaskFlow-API/
├── data/
│   └── tasks.json              # Görevlerin saklandığı kalıcı veri dosyası (örnek veri içerir)
├── docs/
│   ├── Proje-Tanitim-Dokumani.md   # Proje tanıtım dokümanı
│   ├── Veri-Modeli.md              # Veri modeli tasarımı
│   └── API-Dokumani.md             # Request/response örnekli API dokümantasyonu
├── logs/                       # Log dosyaları (çalışma anında oluşur)
│   └── access.log
├── postman/
│   └── TaskFlow-API.postman_collection.json
├── src/
│   ├── config/
│   │   └── index.js            # Uygulama ayarları (port, dosya yolları)
│   ├── controllers/            # HTTP isteklerini karşılayan katman
│   │   ├── taskController.js
│   │   └── reportController.js
│   ├── middleware/             # Ara katmanlar
│   │   ├── logger.js           # İstek loglama middleware'i (zorunlu)
│   │   ├── validateTask.js     # Doğrulama middleware'i
│   │   └── errorHandler.js     # 404 ve merkezi hata yönetimi
│   ├── routes/                 # Rota tanımları
│   │   ├── index.js            # /api ana router
│   │   ├── taskRoutes.js       # /api/tasks
│   │   └── reportRoutes.js     # /api/reports
│   ├── services/               # İş mantığı (business logic)
│   │   └── taskService.js
│   ├── utils/                  # Yardımcı fonksiyonlar
│   │   ├── HttpError.js
│   │   ├── asyncHandler.js
│   │   └── fileStore.js
│   ├── app.js                  # Express uygulaması
│   └── server.js               # Sunucu başlatma noktası
├── .gitignore
├── package.json
└── README.md
```

---

## API Uç Noktaları

Temel adres: `http://localhost:3000`

### Sağlık Kontrolü

| Metot | Endpoint | Açıklama |
|---|---|---|
| GET | `/` | API bilgisi ve endpoint listesi |
| GET | `/api/health` | Sunucu sağlık kontrolü |

### Görev Modülü (`/api/tasks`)

| Metot | Endpoint | Açıklama | Görev Eşleşmesi |
|---|---|---|---|
| GET | `/api/tasks` | Tüm görevleri listeler (filtre/sıralama/sayfalama) | **Listeleme** |
| POST | `/api/tasks` | Yeni görev oluşturur | **Ekleme** |
| GET | `/api/tasks/:id` | Belirli bir görevin detayı | **Detay** |
| PUT | `/api/tasks/:id` | Görevi günceller | **Güncelleme** |
| DELETE | `/api/tasks/:id` | Görevi siler | **Silme** |
| GET | `/api/tasks/search?keyword=` | Başlık/açıklamada arama | İsteğe bağlı |
| GET | `/api/tasks/assignee/:assignee` | Kişiye atanmış görevler | İsteğe bağlı |

**Listeleme query parametreleri:**

| Parametre | Örnek | Açıklama |
|---|---|---|
| `status` | `?status=completed` | `todo`, `in-progress`, `completed` |
| `priority` | `?priority=high` | `low`, `medium`, `high` |
| `assignee` | `?assignee=musa` | Atanan kişi |
| `project` | `?project=TaskFlow` | Proje adı |
| `keyword` | `?keyword=api` | Başlık/açıklama araması |
| `sort` | `?sort=-createdAt` | `createdAt`, `updatedAt`, `priority`, `title`, `dueDate`, `id` (`-` ile azalan) |
| `page` | `?page=1` | Sayfa numarası |
| `limit` | `?limit=10` | Sayfa başına kayıt (maks. 100) |

### Raporlama (`/api/reports`)

| Metot | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/reports/completed` | Tamamlanan görev sayısı ve listesi |
| GET | `/api/reports/pending` | Bekleyen görev sayısı ve listesi |
| GET | `/api/reports/summary` | Genel sistem özeti |

---

## Görev (Task) Veri Modeli

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `id` | number | (otomatik) | Benzersiz görev numarası |
| `title` | string | ✅ | Görev başlığı (maks. 100 karakter) |
| `description` | string | — | Görev açıklaması (maks. 500 karakter) |
| `status` | string | — | `todo` / `in-progress` / `completed` (varsayılan: `todo`) |
| `priority` | string | — | `low` / `medium` / `high` (varsayılan: `medium`) |
| `assignee` | string | ✅ | Görevin atandığı kişi (maks. 50 karakter) |
| `project` | string | — | Ait olduğu proje (varsayılan: `TaskFlow`) |
| `dueDate` | string (tarih) | — | Bitiş tarihi |
| `createdAt` | string (ISO) | (otomatik) | Oluşturma tarihi |
| `updatedAt` | string (ISO) | (otomatik) | Son güncelleme tarihi |

---

## Örnek İstekler

**Yeni görev ekleme**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Veritabani tasarimi",
    "description": "Gorev tablosu semasini hazirla",
    "priority": "high",
    "assignee": "musa"
  }'
```

**Görevleri listeleme (filtreli)**

```bash
curl "http://localhost:3000/api/tasks?status=todo&priority=high&sort=-createdAt&page=1&limit=10"
```

**Görev güncelleme**

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{ "status": "completed" }'
```

**Görev silme**

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

---

## Postman Koleksiyonu

`postman/TaskFlow-API.postman_collection.json` dosyası Postman'e import edilerek tüm
uçlar hazır olarak denenebilir.

**Import adımları:**

1. Postman'i açın → **Import** → **File** sekmesi
2. `postman/TaskFlow-API.postman_collection.json` dosyasını seçin
3. `baseUrl` değişkeni varsayılan olarak `http://localhost:3000` gelir

> **Teslim notu:** Yönergede istenen Postman ekran görüntülerini almak için koleksiyondaki
> Ekleme, Listeleme, Detay, Güncelleme ve Silme isteklerini sırayla çalıştırıp
> ekran görüntüsü alın.

---

## Loglama

Sunucu çalışırken her istek için şu formatta log üretilir:

```
[2026-10-18T09:35:12.481Z] POST   /api/tasks -> 201 (4.3ms)
[2026-10-18T09:35:20.117Z] GET    /api/tasks -> 200 (1.8ms)
[2026-10-18T09:35:31.902Z] DELETE /api/tasks/2 -> 200 (2.1ms)
```

Loglar hem konsola hem de `logs/access.log` dosyasına yazılır.

---

## Dokümantasyon

| Doküman | Açıklama |
|---|---|
| [docs/Proje-Tanitim-Dokumani.md](docs/Proje-Tanitim-Dokumani.md) | Projenin amacı, senaryosu ve temel özellikleri |
| [docs/Veri-Modeli.md](docs/Veri-Modeli.md) | Veri modeli tasarımı |
| [docs/API-Dokumani.md](docs/API-Dokumani.md) | Request/response örnekli API dokümantasyonu |

---

## Lisans

MIT
