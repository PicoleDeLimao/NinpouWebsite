'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../config/auth');

router.get('/me', auth.authenticate(), function(req, res) {
	res.json(req.user);
});

module.exports = router;