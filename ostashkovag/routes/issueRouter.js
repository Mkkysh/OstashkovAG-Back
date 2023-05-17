const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const issueController = require('../controllers/issueController');
const {verifyToken} = require('../utils/auth');

router.post('/add', verifyToken, 
    jsonParser, issueController.addIssueRequest);

router.get('/get', issueController.getIssueRequest);

router.put('/:id/update', issueController.CloseIssue);

module.exports = router;