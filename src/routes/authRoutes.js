const router = require('express').Router();

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', authController.logout);
router.get('/me', requireAuth, asyncHandler(authController.me));

module.exports = router;
