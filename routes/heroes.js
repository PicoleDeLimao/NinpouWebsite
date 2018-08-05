'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Hero = require('../models/Hero');
var StatCalculator = require('./statcalculator');

router.post('/', function(req, res) {
	var hero = new Hero({ id: req.body.id, name: req.body.name });
	hero.save(function(err) {
		if (err) return res.status(400).json({ error: err });
		return res.status(201).json(hero);
	});
});

router.get('/ranking', function(req, res) {  
	StatCalculator.getAllHeroesRanking(function(err, stats) {
		if (err) return res.status(400).json({ 'error': err });
		return res.json(stats);
	});  
});
 
router.get('/:name', function(req, res) {  
	StatCalculator.getHeroStats(req.params.name, function(err, stats) {
		if (err) return res.status(400).json({ 'error': err });
		StatCalculator.getAllHeroesRanking(function(err, heroes) {
			if (err) return res.status(400).json({ 'error': err });
			stats = StatCalculator.getRankingPositions(heroes, stats); 
			return res.json(stats);
		});
	});  
});
 
module.exports = router;
