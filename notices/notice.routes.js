const express = require('express');
const controller = require('./notice.controller');

const router = express.Router();

router.get('/', controller.getNotices);
router.post('/', controller.createNotice);

module.exports = router;
