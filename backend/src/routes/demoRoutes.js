const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', demoController.getAllDemos);
router.post('/', demoController.createDemo);
router.patch('/:id/status', demoController.updateDemoStatus);

module.exports = router;
