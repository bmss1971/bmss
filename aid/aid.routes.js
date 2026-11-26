const express = require('express');
const controller = require('./aid.controller');

const router = express.Router();

router.get('/', controller.getAidRequests);
router.post('/', controller.submitAidRequest);
router.patch('/:id/resolve', controller.resolveAidRequest);

module.exports = router;
