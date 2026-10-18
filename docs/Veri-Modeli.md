# Veri Modeli Tasarımı — TASKFLOW API

## 1. Genel Bakış

Sistem, tek bir ana kaynak üzerinde çalışır: **Görev (Task)**.
Harici bir veritabanı yerine, `data/tasks.json` dosyası üzerinde kalıcı veri saklanır.
Veri modeli, ileride bir ilişkisel veritabanına (SQL Server / PostgreSQL / MongoDB)
kolayca taşınabilecek şekilde tasarlanmıştır.

## 2. Ana Varlık: Task (Görev)

| Alan | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `id` | integer | Otomatik | (artırımlı) | Birincil anahtar (PK). Otomatik üretilir. |
| `title` | string(100) | ✅ Evet | — | Görev başlığı |
| `description` | string(500) | Hayır | `""` | Görev açıklaması |
| `status` | enum | Hayır | `todo` | `todo`, `in-progress`, `completed` |
| `priority` | enum | Hayır | `medium` | `low`, `medium`, `high` |
| `assignee` | string(50) | ✅ Evet | — | Görevin atandığı kişi |
| `project` | string | Hayır | `TaskFlow` | Görevin ait olduğu proje |
| `dueDate` | date string | Hayır | `null` | Görevin bitiş tarihi (YYYY-AA-GG) |
| `createdAt` | ISO datetime | Otomatik | — | Oluşturulma zamanı |
| `updatedAt` | ISO datetime | Otomatik | — | Son güncellenme zamanı |

## 3. Doğrulama Kuralları

| Alan | Kural |
|---|---|
| `title` | Zorunlu, boş olamaz, en fazla 100 karakter |
| `description` | Metin, en fazla 500 karakter |
| `priority` | `low` / `medium` / `high` değerlerinden biri |
| `status` | `todo` / `in-progress` / `completed` değerlerinden biri |
| `assignee` | Zorunlu, boş olamaz, en fazla 50 karakter |
| `dueDate` | Geçerli bir tarih formatı |

## 4. Durum (status) Değerleri

| Değer | Açıklama |
|---|---|
| `todo` | Yapılacak |
| `in-progress` | Devam ediyor |
| `completed` | Tamamlandı |

## 5. Öncelik (priority) Değerleri

| Değer | Ağırlık | Açıklama |
|---|---|---|
| `high` | 3 | Yüksek öncelik |
| `medium` | 2 | Orta öncelik (varsayılan) |
| `low` | 1 | Düşük öncelik |

## 6. Örnek Kayıt (JSON)

```json
{
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
```

## 7. Depolama Yapısı

`data/tasks.json` dosyası, görevleri ve bir sonraki ID sayacını tutar:

```json
{
  "nextId": 7,
  "tasks": [
    { "id": 1, "title": "...", "...": "..." },
    { "id": 2, "title": "...", "...": "..." }
  ]
}
```

- Uygulama başlarken dosya okunur. Dosya yoksa otomatik oluşturulur.
- Her ekleme/güncelleme/silme işleminden sonra dosya güncellenir.
- `nextId` sayacı sayesinde silinen bir görevin ID'si yeni göreve tekrar verilmez.
- Yazma işlemleri sıraya alınır ve **atomik** yapılır: veri önce geçici dosyaya
  yazılır, ardından `rename` ile gerçek dosyanın üzerine taşınır. Böylece eş
  zamanlı isteklerde veri kaybı veya yarım dosya oluşmaz.
- Bozuk JSON durumunda veri sessizce sıfırlanmaz; hata döner.

## 8. Gelecekte İlişkisel Veritabanına Taşıma

Model, aşağıdaki tablo yapısına dönüştürülmeye uygundur:

```sql
CREATE TABLE Tasks (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Title       NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    Status      NVARCHAR(20)  NOT NULL DEFAULT 'todo',
    Priority    NVARCHAR(20)  NOT NULL DEFAULT 'medium',
    Assignee    NVARCHAR(50)  NOT NULL,
    Project     NVARCHAR(100) NULL,
    DueDate     DATETIME      NULL,
    CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE(),
    UpdatedAt   DATETIME      NOT NULL DEFAULT GETDATE()
);
```
