const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const issueController = require('../controllers/issueController');
const {verifyToken, verifyAdminToken} = require('../utils/auth');

router.post('/add', verifyToken, 
    jsonParser, issueController.addIssueRequest);

router.get('/get', 
    verifyAdminToken,
    issueController.getIssueRequest);

router.put('/:id/update', verifyAdminToken,
    issueController.CloseIssue);

module.exports = router;