const router = require('express').Router();

const reportController = require('../controllers/reportController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/completed', asyncHandler(reportController.completed));
router.get('/pending', asyncHandler(reportController.pending));
router.get('/summary', asyncHandler(reportController.summary));

module.exports = router;
