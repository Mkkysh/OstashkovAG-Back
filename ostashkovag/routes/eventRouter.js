const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const upload = require('../utils/uploads');
const eventController = require('../controllers/eventController');

router.get('/future', eventController.getFutureEvent);

router.get('/past', jsonParser, eventController.getPastEvent);

router.post('/find', jsonParser, eventController.findEvent);

router.post('/add', upload
    .fields([{name: "pic", maxCount:1}]), 
    eventController.addEvent);

router.get('/:id', eventController.getEvent);

router.put('/:id/update', upload
    .fields([{name: "pic", maxCount:1}]),
    eventController.updateEvent);

module.exports = router;