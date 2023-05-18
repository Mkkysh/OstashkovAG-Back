const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const userController = require('../controllers/userController');
const { verifyToken } = require('../utils/auth');
const uploads = require('../utils/uploads');

router.get('/get', userController.getUsers);

router.post('/signup', jsonParser, userController.signup);

router.post('/login', jsonParser, userController.login);

router.put('/refresh', userController.refresh);

router.delete('/logout', userController.logout);

router.post('/tracking/:id', verifyToken, 
    userController.addTracking);

router.delete('/tracking/:id', verifyToken,
    userController.deleteTracking);

router.get('/tracking', verifyToken,
    userController.getTracking);

router.post('/photo/add', uploads
    .fields([{name: "pic", maxCount:1}]),
    verifyToken,
    userController.addPhoto);

router.put('/update', uploads
    .fields([{name: "pic", maxCount:1}]),
    verifyToken,
    userController.updateData);

router.get('/get', userController.getUser);

module.exports = router;