const feedbackController = require('../controllers/feedbackController');
const { verifyToken } = require('../utils/auth');
const express = require('express');
const router = express.Router();
const jsonParser = express.json();

router.post('/:id/add', verifyToken,
    jsonParser, feedbackController.addFeedback);

router.delete('/:id/delete', verifyToken,
    feedbackController.deleteFeedback);

router.put('/:id/update', verifyToken,
    jsonParser, feedbackController.updateFeedback);

module.exports = router;