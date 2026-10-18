# Proje Tanıtım Dokümanı — TASKFLOW API

## 1. Projenin Adı

**TASKFLOW — Görev ve Proje Yönetim Sistemi REST API'si**

## 2. Projenin Amacı

Bu projenin amacı; **Node.js** ve **Express.js** kullanarak **REST API** mimarisine uygun
bir **Görev ve Proje Yönetim Sistemi** API'si tasarlamak ve geliştirmektir. Proje
kapsamında görev yönetimi modülü (CRUD), temel middleware (logger), doğrulama
(validation) ve raporlama servisleri hayata geçirilmiştir.

## 3. Senaryo

Bir yazılım şirketi, ekip içerisindeki **görevleri**, **projeleri** ve **çalışanların
sorumluluklarını** tek bir sistem üzerinden takip etmek istemektedir. Şirketin ihtiyaçları:

- Görevlerin oluşturulması
- Görevlerin çalışanlara atanması
- Görevin durumunun takip edilmesi (yapılacak / devam ediyor / tamamlandı)
- Görevlerin önceliklendirilmesi (düşük / orta / yüksek)

Bu ihtiyaçları karşılamak üzere, harici bir veritabanı kurulumu gerektirmeyen, JSON
dosyası üzerinde kalıcı veri saklayan bir REST API altyapısı geliştirilmiştir.

## 4. Temel Özellikler

### 4.1 Görev Yönetim Modülü (Zorunlu)

| İşlem | Endpoint | Açıklama |
|---|---|---|
| Ekleme | `POST /api/tasks` | Yeni görev oluşturur |
| Listeleme | `GET /api/tasks` | Tüm görevleri listeler |
| Detay | `GET /api/tasks/:id` | Belirli bir görevi getirir |
| Güncelleme | `PUT /api/tasks/:id` | Görev bilgilerini günceller |
| Silme | `DELETE /api/tasks/:id` | Görevi siler |

### 4.2 Temel Middleware — Logger (Zorunlu)

Tüm API isteklerine ait **HTTP metodu**, **endpoint** ve **zaman damgası** bilgileri,
istek tamamlandığında hem konsola hem de `logs/access.log` dosyasına kaydedilir.
Ayrıca yanıt durum kodu ve işlem süresi (ms) de loglanır.

Örnek log çıktısı:

```
[2026-10-18T09:35:12.481Z] POST   /api/tasks -> 201 (4.3ms)
[2026-10-18T09:35:20.117Z] GET    /api/tasks -> 200 (1.8ms)
```

### 4.3 Doğrulama (Validation) Middleware

`title`, `description`, `priority` ve `assignee` alanları doğrulanır. Eksik veya geçersiz
veri gönderildiğinde **400 Bad Request** durum kodu ve açıklayıcı hata mesajları döner.

### 4.4 İleri Seviye API Özellikleri (İsteğe Bağlı)

- **Duruma göre filtreleme:** `GET /api/tasks?status=completed`
- **Önceliğe göre filtreleme:** `GET /api/tasks?priority=high`
- **Görev arama:** `GET /api/tasks/search?keyword=backend`
- **Kullanıcı bazlı listeleme:** `GET /api/tasks/assignee/musa`
- **Sayfalama:** `GET /api/tasks?page=1&limit=10`
- **Sıralama:** `GET /api/tasks?sort=-createdAt`

### 4.5 Raporlama Servisleri (İsteğe Bağlı)

- `GET /api/reports/completed` — Tamamlanan görev sayısı
- `GET /api/reports/pending` — Bekleyen görev sayısı
- `GET /api/reports/summary` — Genel sistem özeti

## 5. Kullanılan Teknolojiler

| Teknoloji | Sürüm | Amaç |
|---|---|---|
| Node.js | >= 18 | Çalışma ortamı |
| Express.js | 4.x | Web framework ve routing |
| CORS | 2.x | Frontend erişimi |
| JSON dosyası | — | Kalıcı veri saklama |

## 6. Mimari Yaklaşım

Proje, katmanlı (layered) bir mimari ile geliştirilmiştir. Bu sayede sorumluluklar
birbirinden ayrılmış, kod okunabilir ve sürdürülebilir hale getirilmiştir:

- **Routes:** İsteklerin yönlendirildiği rota tanımları
- **Middleware:** Logger, validation, hata yönetimi gibi ara katmanlar
- **Controllers:** HTTP istek/yanıt döngüsünü yönetir
- **Services:** İş mantığı (business logic)
- **Utils / Config:** Yardımcı fonksiyonlar ve uygulama ayarları

## 7. Sonuç ve Kazanımlar

Bu proje ile:

- REST API mimarisi ve HTTP metotlarının (GET, POST, PUT, DELETE) doğru kullanımı
- Express.js ile routing ve middleware yazımı
- Katmanlı proje mimarisi ve klasör yapısı
- Veri doğrulama ve merkezi hata yönetimi
- Bir API'nin Postman ile test edilmesi

konularında uygulamalı deneyim kazanılmıştır.
