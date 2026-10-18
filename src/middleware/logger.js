const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Logger (Temel Middleware)
 * ---------------------------------------------------------------
 * Gelen her API istegine ait su bilgileri kaydeder:
 *   - HTTP metodu  (GET, POST, PUT, DELETE ...)
 *   - Endpoint     (/api/tasks ...)
 *   - Zaman damgasi (ISO 8601 tarih/saat)
 *   - Durum kodu ve islem suresi (ms)
 *
 * Kayitlar hem konsola hem de logs/access.log dosyasina yazilir.
 */
function buildLogLine(req, statusCode, durationMs) {
  const timestamp = new Date().toISOString();
  const method = req.method.padEnd(6, ' ');
  const url = req.originalUrl;

  return `[${timestamp}] ${method} ${url} -> ${statusCode} (${durationMs.toFixed(1)}ms)`;
}

function appendToLogFile(line) {
  try {
    fs.mkdirSync(path.dirname(config.logFile), { recursive: true });
    fs.appendFile(config.logFile, line + '\n', () => {});
  } catch {
    // Log dosyasina yazilamazsa uygulama akisini bozma.
  }
}

module.exports = function logger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const line = buildLogLine(req, res.statusCode, durationMs);

    console.log(line);
    appendToLogFile(line);
  });

  next();
};
