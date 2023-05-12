const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const userController = require('../controllers/userController');
const verifyToken = require('../app.js');

router.post('/:id/review', verifyToken,
    jsonParser, userController.addFeedback);

module.exports = router;