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

module.exports = server;
