const express = require('express');
const controller = require('./member.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/:id/id-card', authenticateToken, controller.getIdCard);

module.exports = router;
