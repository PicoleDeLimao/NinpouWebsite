'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var jwt = require('jsonwebtoken');

router.post('/local', auth.authenticate('local'), function(req, res) {
	var token = jwt.sign({ openID: req.user.openID }, auth.secretOrKey);
	res.send(token);
});

router.get('/steam', auth.authenticate('steam'));

router.get('/steam/return', auth.authenticate('steam', { failureRedirect: '/' }), function(req, res) {
	var token = jwt.sign({ openID: req.user.openID }, auth.secretOrKey);
	res.redirect('/#/login?token=' + token);
});

module.exports = router;