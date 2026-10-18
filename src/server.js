const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  /* eslint-disable no-console */
  console.log('');
  console.log('==================================================');
  console.log(`  ${config.api.name} v${config.api.version}`);
  console.log('==================================================');
  console.log(`  Sunucu    : http://localhost:${config.port}`);
  console.log(`  Health    : http://localhost:${config.port}/api/health`);
  console.log(`  Gorevler  : http://localhost:${config.port}/api/tasks`);
  console.log(`  Log dosyasi: logs/access.log`);
  console.log('==================================================');
  console.log('');
  /* eslint-enable no-console */
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Hata: ${config.port} portu zaten kullaniliyor. Baska bir port deneyin (or: PORT=4000).`
    );
  } else {
    console.error('Sunucu baslatilamadi:', err);
  }

  process.exit(1);
});

// Sunucuyu duzgun sekilde kapat (graceful shutdown)
function shutdown(signal) {
  console.log(`\n${signal} alindi. Sunucu kapatiliyor...`);
  server.close(() => {
    console.log('Sunucu kapatildi.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Beklenmeyen hatalar sunucuyu sessizce cokertmesin.
process.on('unhandledRejection', (reason) => {
  console.error('Islenmeyen promise hatasi:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Yakalanmayan hata:', err);
});

module.exports = server;
