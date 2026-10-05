const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.get('/:id/demos', customerController.getCustomerDemos);
router.get('/:id/subscriptions', customerController.getCustomerSubscriptions);
router.get('/:id/payments', customerController.getCustomerPayments);

module.exports = router;
