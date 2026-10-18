const path = require('path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dataFile:
    process.env.DATA_FILE ||
    path.join(__dirname, '..', '..', 'data', 'tasks.json'),
  logFile:
    process.env.LOG_FILE ||
    path.join(__dirname, '..', '..', 'logs', 'access.log'),
  api: {
    name: 'gorev-api',
    version: '1.0.0',
  },
};
