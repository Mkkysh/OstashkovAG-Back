const eventRequestController = require('../controllers/eventRequestController');
const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const { verifyToken } = require('../utils/auth');

router.post('/add', jsonParser, verifyToken, 
eventRequestController.addEventRequest);

router.get('/get', jsonParser,
eventRequestController.getEventRequest);

router.put('/:id/update', jsonParser,
eventRequestController.updateStatus);

module.exports = router;