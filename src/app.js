const express = require('express');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Guvenlik: framework bilgisini gizle
app.disable('x-powered-by');

/* ------------------------- Genel Middleware ------------------------- */
app.use(cors()); // Frontend (React/Vue) uygulamalarinin API'ye erismesine izin verir
app.use(express.json({ limit: '100kb' })); // JSON govdeleri okur (boyut siniri ile)
app.use(express.urlencoded({ extended: true, limit: '100kb' })); // Form verileri
app.use(logger); // Istek loglama (HTTP metodu, endpoint, zaman damgasi)

/* ---------------------------- Karsilama ---------------------------- */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: config.api.name,
    version: config.api.version,
    description: 'Gorev ve Proje Yonetim Sistemi REST API',
    endpoints: {
      health: 'GET /api/health',
      tasks: {
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        detail: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        remove: 'DELETE /api/tasks/:id',
        search: 'GET /api/tasks/search?keyword=',
        byAssignee: 'GET /api/tasks/assignee/:assignee',
      },
      reports: {
        completed: 'GET /api/reports/completed',
        pending: 'GET /api/reports/pending',
        summary: 'GET /api/reports/summary',
      },
    },
  });
});

/* ------------------------------ Rotalar ---------------------------- */
app.use('/api', routes);

/* --------------------------- Hata Yonetimi -------------------------- */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
