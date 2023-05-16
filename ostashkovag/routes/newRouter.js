const newController = require('../controllers/newController');
const express = require('express');
const router = express.Router();
const jsonParser = express.json();

router.put('/:id/update', jsonParser, newController.updateNew);

router.post('/add', jsonParser, newController.addNew);

router.get('/get', newController.getNews);

router.delete('/:id/delete', newController.deleteNew);

module.exports = router;
