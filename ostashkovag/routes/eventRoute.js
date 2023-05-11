const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/future', eventController.getFutureEvent);

module.exports = router;