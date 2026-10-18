const router = require('express').Router();

const config = require('../config');
const taskRoutes = require('./taskRoutes');
const reportRoutes = require('./reportRoutes');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    name: config.api.name,
    version: config.api.version,
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

router.use('/tasks', taskRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
