# API Dokümantasyonu — TASKFLOW API

**Temel Adres (Base URL):** `http://localhost:3000`
**İçerik Tipi (Content-Type):** `application/json`

Tüm yanıtlar ortak bir `success` alanı içerir. Başarılı yanıtlar `data`, hatalı yanıtlar
`message` (ve gerekiyorsa `errors`) alanı döner.

---

## 1. Genel Bilgiler

### 1.1 Sağlık Kontrolü

`GET /api/health`

**Yanıt (200):**

```json
{
  "success": true,
  "status": "ok",
  "name": "TASKFLOW API",
  "version": "1.0.0",
  "uptime": 21.78,
  "timestamp": "2026-10-18T19:21:39.222Z"
}
```

---

## 2. Görev Modülü (CRUD)

### 2.1 Görevleri Listeleme

`GET /api/tasks`

**Query Parametreleri**

| Parametre | Tip | Açıklama |
|---|---|---|
| `status` | string | `todo`, `in-progress`, `completed` |
| `priority` | string | `low`, `medium`, `high` |
| `assignee` | string | Atanan kişi |
| `project` | string | Proje adı |
| `keyword` | string | Başlık/açıklama araması |
| `sort` | string | `createdAt`, `updatedAt`, `priority`, `title`, `dueDate`, `id` (azalan için başına `-`) |
| `page` | number | Sayfa numarası (varsayılan: 1) |
| `limit` | number | Sayfa başına kayıt (varsayılan: tümü, maks: 100) |

**Örnek İstek**

```
GET /api/tasks?status=todo&priority=high&sort=-createdAt&page=1&limit=10
```

**Yanıt (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "title": "Validation middleware ekle",
      "description": "title, description, priority ve assignee alanlarini dogrula.",
      "status": "todo",
      "priority": "high",
      "assignee": "burak",
      "project": "TaskFlow",
      "dueDate": "2026-10-22",
      "createdAt": "2026-10-15T11:05:00.000Z",
      "updatedAt": "2026-10-15T11:05:00.000Z"
    }
  ],
  "total": 1,
  "count": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 2.2 Görev Ekleme

`POST /api/tasks`

**İstek Gövdesi**

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `title` | ✅ | Görev başlığı |
| `assignee` | ✅ | Atanan kişi |
| `description` | — | Açıklama |
| `priority` | — | `low` / `medium` / `high` |
| `status` | — | `todo` / `in-progress` / `completed` |
| `project` | — | Proje adı |
| `dueDate` | — | Bitiş tarihi |

**Örnek İstek**

```json
{
  "title": "Veritabani tasarimi",
  "description": "Gorev tablosu semasini hazirla",
  "priority": "high",
  "assignee": "musa"
}
```

**Yanıt (201 Created):**

```json
{
  "success": true,
  "message": "Gorev basariyla olusturuldu.",
  "data": {
    "id": 7,
    "title": "Veritabani tasarimi",
    "description": "Gorev tablosu semasini hazirla",
    "status": "todo",
    "priority": "high",
    "assignee": "musa",
    "project": "TaskFlow",
    "dueDate": null,
    "createdAt": "2026-10-18T19:21:39.313Z",
    "updatedAt": "2026-10-18T19:21:39.313Z"
  }
}
```

**Hatalı Yanıt (400 Bad Request):**

```json
{
  "success": false,
  "message": "Gecersiz istek verisi.",
  "errors": ["title alani zorunludur."]
}
```

---

### 2.3 Görev Detayı

`GET /api/tasks/:id`

**Örnek İstek**

```
GET /api/tasks/1
```

**Yanıt (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "API dokumantasyonunu hazirla",
    "description": "Tum CRUD endpoint'leri icin request/response ornekleri ekle.",
    "status": "in-progress",
    "priority": "high",
    "assignee": "musa",
    "project": "TaskFlow",
    "dueDate": "2026-10-25",
    "createdAt": "2026-10-12T08:15:00.000Z",
    "updatedAt": "2026-10-16T10:30:00.000Z"
  }
}
```

**Hatalı Yanıt (404 Not Found):**

```json
{
  "success": false,
  "message": "ID'si 9999 olan gorev bulunamadi."
}
```

---

### 2.4 Görev Güncelleme

`PUT /api/tasks/:id`

Gönderilen alanlar güncellenir; gönderilmeyen alanlar değişmez. `updatedAt` otomatik
olarak yenilenir, `id` ve `createdAt` değiştirilemez.

**Örnek İstek**

```
PUT /api/tasks/7
```

```json
{ "status": "completed" }
```

**Yanıt (200):**

```json
{
  "success": true,
  "message": "Gorev basariyla guncellendi.",
  "data": {
    "id": 7,
    "title": "Veritabani tasarimi",
    "description": "Gorev tablosu semasini hazirla",
    "status": "completed",
    "priority": "high",
    "assignee": "musa",
    "project": "TaskFlow",
    "dueDate": null,
    "createdAt": "2026-10-18T19:21:39.313Z",
    "updatedAt": "2026-10-18T19:21:39.324Z"
  }
}
```

---

### 2.5 Görev Silme

`DELETE /api/tasks/:id`

**Örnek İstek**

```
DELETE /api/tasks/7
```

**Yanıt (200):**

```json
{
  "success": true,
  "message": "Gorev basariyla silindi.",
  "data": {
    "id": 7,
    "title": "Veritabani tasarimi",
    "...": "..."
  }
}
```

---

### 2.6 Görev Arama (İsteğe Bağlı)

`GET /api/tasks/search?keyword=test`

**Yanıt (200):**

```json
{
  "success": true,
  "keyword": "test",
  "data": [
    { "id": 5, "title": "Postman testlerini tamamla", "...": "..." }
  ],
  "total": 1,
  "count": 1,
  "page": 1,
  "limit": 1,
  "totalPages": 1
}
```

---

### 2.7 Kullanıcı Bazlı Listeleme (İsteğe Bağlı)

`GET /api/tasks/assignee/musa`

**Yanıt (200):**

```json
{
  "success": true,
  "assignee": "musa",
  "data": [
    { "id": 1, "title": "API dokumantasyonunu hazirla", "...": "..." }
  ],
  "total": 1,
  "count": 1,
  "page": 1,
  "limit": 1,
  "totalPages": 1
}
```

---

## 3. Raporlama Servisleri (İsteğe Bağlı)

### 3.1 Tamamlanan Görevler

`GET /api/reports/completed`

```json
{
  "success": true,
  "report": "completed",
  "count": 3,
  "tasks": [
    { "id": 2, "title": "Logger middleware gelistir", "status": "completed", "...": "..." }
  ]
}
```

### 3.2 Bekleyen Görevler

`GET /api/reports/pending`

```json
{
  "success": true,
  "report": "pending",
  "count": 4,
  "tasks": [
    { "id": 1, "title": "API dokumantasyonunu hazirla", "status": "in-progress", "...": "..." }
  ]
}
```

### 3.3 Genel Sistem Özeti

`GET /api/reports/summary`

```json
{
  "success": true,
  "report": "summary",
  "data": {
    "total": 6,
    "completed": 2,
    "pending": 4,
    "byStatus": { "todo": 2, "in-progress": 2, "completed": 2 },
    "byPriority": { "high": 3, "medium": 2, "low": 1 },
    "assignees": ["musa", "ayse", "burak"],
    "assigneeCount": 3,
    "generatedAt": "2026-10-18T19:21:39.343Z"
  }
}
```

---

## 4. HTTP Durum Kodları

| Kod | Anlam | Kullanım |
|---|---|---|
| 200 | OK | Başarılı listeleme, detay, güncelleme, silme |
| 201 | Created | Başarılı görev ekleme |
| 400 | Bad Request | Eksik/geçersiz veri (validation hatası) |
| 404 | Not Found | Görev veya endpoint bulunamadı |
| 500 | Internal Server Error | Beklenmeyen sunucu hatası |

---

## 5. Yazılı Test Senaryoları

Aşağıdaki senaryolar Postman üzerinden manuel olarak uygulanabilir.

| # | Senaryo | Adım | Beklenen Sonuç |
|---|---|---|---|
| 1 | Sağlık kontrolü | `GET /api/health` | 200, `status: ok` |
| 2 | Listeleme | `GET /api/tasks` | 200, `total` ve `data` dolu |
| 3 | Ekleme (geçerli) | `POST /api/tasks` (title + assignee) | 201, yeni `id` |
| 4 | Ekleme (geçersiz) | `POST /api/tasks` (title eksik) | 400, hata mesajı |
| 5 | Detay | `GET /api/tasks/1` | 200, görev bilgisi |
| 6 | Detay (yok) | `GET /api/tasks/9999` | 404 |
| 7 | Güncelleme | `PUT /api/tasks/1` `{"status":"completed"}` | 200, alan güncel |
| 8 | Filtreleme | `GET /api/tasks?status=completed` | 200, sadece completed |
| 9 | Arama | `GET /api/tasks/search?keyword=test` | 200, eşleşen kayıtlar |
| 10 | Sayfalama | `GET /api/tasks?page=1&limit=2` | 200, `count: 2` |
| 11 | Silme | `DELETE /api/tasks/:id` | 200, silinen kayıt |
| 12 | Silme (yok) | `DELETE /api/tasks/9999` | 404 |
