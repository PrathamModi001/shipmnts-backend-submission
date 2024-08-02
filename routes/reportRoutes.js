const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/report/traffic', reportController.analyzeTrafficUpdates);

module.exports = router;
