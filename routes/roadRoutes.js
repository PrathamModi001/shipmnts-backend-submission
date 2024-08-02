const express = require('express');
const router = express.Router();
const roadController = require('../controllers/roadController');

router.post('/roads', roadController.addRoad);
router.get('/roads/:id/traffic-condition', roadController.generateCsvReportForRoad);

module.exports = router;