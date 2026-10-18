const HttpError = require('../utils/HttpError');

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint yok: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err instanceof HttpError ? err.status : err.status || 500;
  let message = err.message || 'Sunucu hatasi';
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Gecersiz JSON';
    details = undefined;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Istek govdesi cok buyuk';
    details = undefined;
  } else if (status >= 500) {
    // detayi sadece loga yaz, disari verme
    console.error(err);
    message = 'Sunucu hatasi';
    details = undefined;
  }

  const body = { success: false, message };
  if (details) body.details = details;

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
