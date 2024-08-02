const express = require('express');
const router = express.Router();
const pathController = require('../controllers/pathController');

router.get('/shortest-path', pathController.getShortestPath);

module.exports = router;
