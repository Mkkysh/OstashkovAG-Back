const eventRequestController = require('../controllers/eventRequestController');
const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const { verifyToken, verifyAdminToken } = require('../utils/auth');

router.post('/add', jsonParser, verifyToken, 
eventRequestController.addEventRequest);

router.get('/get', jsonParser, verifyAdminToken,
eventRequestController.getEventRequest);

router.put('/:id/update', jsonParser, verifyAdminToken,
eventRequestController.updateStatus);

module.exports = router;