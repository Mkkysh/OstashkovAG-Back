const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const upload = require('../utils/uploads');
const eventController = require('../controllers/eventController');

router.get('/future', eventController.getFutureEvent);

router.get('/past', jsonParser, eventController.getPastEvent);

router.post('/find', jsonParser, eventController.findEvent);

router.delete('/:id/delete', eventController.deleteEvent);

router.get('/findbydate', jsonParser, eventController.getEventByDate);

router.post('/add', upload
    .fields([{name: "pic", maxCount:1}]), 
    eventController.addEvent);

router.get('/:id', eventController.getEvent);

router.put('/:id/update', upload
    .fields([{name: "pic", maxCount:1}]),
    eventController.updateEvent);

router.post('/:id/photorecord/add', upload
    .fields([{name: "pic", maxCount:30}]),
    eventController.addPhotoRecord);

router.delete('/photorecord/delete/:name', 
    eventController.deletePhotoRecord);

module.exports = router;