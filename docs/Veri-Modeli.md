# Veri Modeli

Tek bir kayıt tipi var: `Task`. Aşağıdaki alanları kullanıyorum.

| Alan | Tip | Zorunlu | Not |
|---|---|---|---|
| `id` | sayı | otomatik | Artan numara, silinen ID tekrar verilmiyor |
| `title` | metin | evet | En fazla 100 karakter |
| `description` | metin | hayır | En fazla 500 karakter, boş olabilir |
| `status` | metin | hayır | `todo`, `in-progress`, `completed`; varsayılan `todo` |
| `priority` | metin | hayır | `low`, `medium`, `high`; varsayılan `medium` |
| `assignee` | metin | evet | Görevin atandığı kişi, en fazla 50 karakter |
| `project` | metin | hayır | Varsayılan `genel` |
| `dueDate` | tarih | hayır | `YYYY-AA-GG`, boş bırakılabilir |
| `createdAt` | tarih-saat | otomatik | Oluşturulma zamanı |
| `updatedAt` | tarih-saat | otomatik | Son güncelleme |

Örnek kayıt:

```json
{
  "id": 1,
  "title": "Bitirme projesi sunumu",
  "description": "Slaytlari hazirla, canli demo icin Postman koleksiyonunu duzenle.",
  "status": "in-progress",
  "priority": "high",
  "assignee": "samil",
  "project": "bitirme",
  "dueDate": "2026-10-29",
  "createdAt": "2026-10-12T19:04:00.000Z",
  "updatedAt": "2026-10-17T21:15:00.000Z"
}
```

## Dosya düzeni

```json
{
  "nextId": 9,
  "tasks": [ ... ]
}
```

`nextId` bir sonraki görevin numarasını tutuyor. Sadece en büyük ID'ye bakıp bir
fazlasını verseydim, silinen görevin numarası yeni göreve tekrar gelirdi. Onun
için sayacı ayrı tutuyorum.

Dosya yoksa ilk çalıştırmada oluşuyor. Her yazma işleminde önce `.tmp` dosyasına
yazılıp sonra `rename` ile asıl dosyanın üzerine taşınıyor; yarım yazılmış dosya
okunmuyor. Aynı anda gelen yazma istekleri sıraya alınıyor. JSON bozuksa veri
sessizce sıfırlanmıyor, hata dönüyor.
