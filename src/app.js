const express = require('express');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(logger);

app.get('/', (req, res) => {
  res.json({
    name: config.api.name,
    version: config.api.version,
    endpoints: [
      'GET    /api/health',
      'GET    /api/tasks',
      'POST   /api/tasks',
      'GET    /api/tasks/:id',
      'PUT    /api/tasks/:id',
      'DELETE /api/tasks/:id',
      'GET    /api/tasks/search?keyword=',
      'GET    /api/tasks/assignee/:assignee',
      'GET    /api/reports/completed',
      'GET    /api/reports/pending',
      'GET    /api/reports/summary',
    ],
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
