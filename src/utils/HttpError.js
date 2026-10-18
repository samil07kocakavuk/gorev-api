// HTTP durum kodu tasiyan hata. Ornek: throw new HttpError(404, 'Gorev yok')
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;

    if (details) {
      this.details = details;
    }
  }
}

module.exports = HttpError;
