/**
 * async fonksiyonlarda olusan hatalari Express hata middleware'ine aktarir.
 * Boylece her controller icinde try/catch yazmak zorunda kalmayiz.
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
