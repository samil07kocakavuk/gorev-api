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
 * Merkezi hata yakalayici (error handling middleware).
 * Uygulamanin herhangi bir yerinde firlatilan hatalar burada
 * tek noktadan standart bir JSON formatina cevrilir.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isHttpError = err instanceof HttpError;
  const status = isHttpError ? err.status : err.status || 500;

  if (status >= 500) {
    console.error('Beklenmeyen hata:', err);
  }

  const payload = {
    success: false,
    message: isHttpError || err.message ? err.message : 'Sunucu hatasi.',
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
