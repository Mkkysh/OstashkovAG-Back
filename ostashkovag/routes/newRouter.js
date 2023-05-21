const newController = require('../controllers/newController');
const express = require('express');
const { verifyAdminToken } = require('../utils/auth');
const router = express.Router();
const jsonParser = express.json();

router.put('/:id/update', jsonParser, 
    verifyAdminToken,
    newController.updateNew);

router.post('/add', jsonParser, 
    verifyAdminToken,
    newController.addNew);

router.get('/get', newController.getNews);

router.delete('/:id/delete', 
    verifyAdminToken,
    newController.deleteNew);

module.exports = router;
