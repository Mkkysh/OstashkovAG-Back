const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const upload = require('../utils/uploads');
const eventController = require('../controllers/eventController');
const { verifyToken, verifyAdminToken } = require('../utils/auth');

router.get('/get', jsonParser, eventController.getEvents);

router.post('/find', jsonParser, eventController.findEvent);

router.delete('/:id/delete', verifyToken,
    eventController.deleteEvent);

router.post('/add', upload
    .fields([{name: "pic", maxCount:1}]), 
    verifyAdminToken,
    eventController.addEvent);

router.get('/:id', verifyToken,
     eventController.getEvent);

router.put('/:id/update', upload
    .fields([{name: "pic", maxCount:1}]),
    verifyAdminToken,
    eventController.updateEvent);

router.post('/:id/photorecord/add', upload
    .fields([{name: "pic", maxCount:30}]),
    verifyAdminToken,
    eventController.addPhotoRecord);

router.delete('/photorecord/delete/:name',
    verifyAdminToken, 
    eventController.deletePhotoRecord);

module.exports = router;