const express = require('express');
const controller = require('./finance.controller');

const router = express.Router();

router.get('/summary', controller.getSummary);
router.post('/transactions', controller.createTransaction);

module.exports = router;
