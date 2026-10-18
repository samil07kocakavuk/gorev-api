const HttpError = require('../utils/HttpError');

/**
 * Tanimlanmayan endpoint'ler icin 404 yaniti.
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint bulunamadi: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Merkezi hata yakalayici.
 * - 4xx hatalarinda aciklayici mesaj doner.
 * - 5xx hatalarinda detaylar loglanir, istemciye genel mesaj doner
 *   (ic hata detaylari disari sizdirilmaz).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err instanceof HttpError ? err.status : err.status || 500;
  let message = err.message || 'Sunucu hatasi.';
  let details = err.details;

  // Body parser hatalari
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Gecersiz JSON formati.';
    details = undefined;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Istek govdesi cok buyuk.';
    details = undefined;
  } else if (status >= 500) {
    console.error('Beklenmeyen hata:', err);
    message = 'Sunucu hatasi.';
    details = undefined;
  }

  const payload = { success: false, message };

  if (details) {
    payload.details = details;
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
