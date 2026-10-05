const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.recordPayment);

module.exports = router;
