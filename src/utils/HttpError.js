/**
 * Uygulama icinde firlatilan, HTTP durum kodu tasiyan hata sinifi.
 * Ornek: throw new HttpError(404, 'Gorev bulunamadi');
 */
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
