const router = require('express').Router();

const config = require('../config');
const taskRoutes = require('./taskRoutes');
const reportRoutes = require('./reportRoutes');

/**
 * Ana API router'i  ->  /api
 * Tum alt moduller burada birlestirilir.
 */

// Saglik kontrolu (health check)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    name: config.api.name,
    version: config.api.version,
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

// Moduller
router.use('/tasks', taskRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
