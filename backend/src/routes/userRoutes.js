const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;
