const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const eventController = require('../controllers/eventController');

router.get('/future', eventController.getFutureEvent);

router.get('/past', jsonParser, eventController.getPastEvent);

router.post('/find', jsonParser, eventController.findEvent);

module.exports = router;