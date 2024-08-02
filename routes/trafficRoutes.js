const express = require('express');
const router = express.Router();

const trafficController = require('../controllers/trafficController');

router.post('/traffic-updates', trafficController.updateTrafficCondition);

module.exports = router;

