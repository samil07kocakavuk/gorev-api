const path = require('path');

/**
 * Uygulama genelindeki sabit ayarlar.
 * Ortam degiskenleri (.env) ile gecersiz kilinabilir.
 */
module.exports = {
  // Sunucunun dinleyecegi port
  port: Number(process.env.PORT) || 3000,

  // Gorevlerin kalici olarak saklandigi JSON dosyasi
  dataFile:
    process.env.DATA_FILE ||
    path.join(__dirname, '..', '..', 'data', 'tasks.json'),

  // Erisim (access) loglarinin yazildigi dosya
  logFile:
    process.env.LOG_FILE ||
    path.join(__dirname, '..', '..', 'logs', 'access.log'),

  // API surumu / meta bilgiler
  api: {
    name: 'TASKFLOW API',
    version: '1.0.0',
  },
};
