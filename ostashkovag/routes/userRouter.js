const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const userController = require('../controllers/userController');
const { verifyToken } = require('../utils/auth');

router.post('/:id/review', verifyToken,
    jsonParser, userController.addFeedback);

router.get('/get', userController.getUsers);

router.post('/signup', jsonParser, userController.signup);

router.post('/login', jsonParser, userController.login);

router.put('/refresh', userController.refresh);

router.delete('/logout', userController.logout);

module.exports = router;