const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const upload = require('../utils/uploads');
const eventController = require('../controllers/eventController');

router.get('/future', eventController.getFutureEvent);

router.get('/past', jsonParser, eventController.getPastEvent);

router.post('/find', jsonParser, eventController.findEvent);

router.post('/add', upload
    .fields([{name: "pic", maxCount:10}]), 
    eventController.addEvent);

router.get('/:id', eventController.getEvent);

module.exports = router;