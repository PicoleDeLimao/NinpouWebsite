'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Hero = require('../models/Hero');

router.post('/', function(req, res) {
	var hero = new Hero({ id: req.body.id, name: req.body.name });
	hero.save(function(err) {
		if (err) return res.status(400).json({ error: err });
		return res.status(201).json(hero);
	});
});

module.exports = router;
