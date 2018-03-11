'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Alias = require('../models/Alias');
var Stat = require('../models/Stat');

router.get('/:alias', function(req, res) {
	Alias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json(err);
		else if (!alias) return res.status(404).json({ error: 'Alias not found.' });
		return res.json(alias);
	});
});

router.get('/all/:username', function(req, res) {
	Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json(err);
		return res.json(alias);
	});
});

function calculateScore(stat) {
	var score = (stat.kills / stat.games * 10 - stat.deaths / stat.games * 5 + stat.assists / stat.games * 2 * AgrestiCoullLower(stat.games, stat.wins)) / 1068.0 / Math.max(1, 100 - AgrestiCoullLower(stat.games, stat.wins) * 100) * (stat.gpm / stat.games * AgrestiCoullLower(stat.games, stat.wins) * 100) * 1000000;  
	if (isNaN(score)) return 0;
	return score;
}; 

router.put('/:username/:alias', function(req, res) {
	Alias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json(err);
		else if (alias) {
			return res.status(400).json({ error: 'Alias is already being used.' });
		} else {
			Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
				if (err) return res.status(500).json(err);
				else if (alias) {
					alias.alias.push(req.params.alias.toLowerCase());
				} else {
					alias = new Alias({
						username: req.params.username.toLowerCase(),
						alias: [req.params.alias.toLowerCase()]
					});
				}
				alias.save(function(err) {
					if (err) return res.status(500).json(err);
					Stat.findOne({ username: req.params.alias.toLowerCase() }, function(err, sourceStat) {
						if (err) return res.status(500).json(err);
						else if (sourceStat) {
							Stat.findOne({ username: req.params.username.toLowerCase() }, function(err, targetStat) {
								if (err) return res.status(500).json(err);
								else if (targetStat) {
									targetStat.kills += sourceStat.kills;
									targetStat.deaths += sourceStat.deaths;
									targetStat.assists += sourceStat.assists;
									targetStat.gpm += sourceStat.gpm;
									targetStat.wins += sourceStat.wins;
									targetStat.games += sourceStat.games;
									targetStat.score = calculateScore(targetStat);
									targetStat.save(function(err) {
										if (err) return res.status(500).json(err);
										sourceStat.remove(function(err) {
											if (err) return res.status(500).json(err);
											return res.status(201).send();
										});
									});
								} else {
									sourceStat.username = req.params.username.toLowerCase();
									sourceStat.save(function(err) {
										if (err) return res.status(500).json(err);
										return res.status(201).send();
									});
								}
							});
						} else {
							return res.status(201).send();
						}
					});
				});
			});
		}
	});
	
});

module.exports = router;