'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Alias = require('../models/Alias'); 
var Mission = require('../models/Mission');
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Calculator = require('./calculator');

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

function isToday(momentDate) {
	var REFERENCE = moment();
	var TODAY = REFERENCE.clone().startOf('day');
	return momentDate.isSame(TODAY, 'd');
}

function isYesterday(momentDate) {
	var REFERENCE = moment();
	var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
	return momentDate.isSame(YESTERDAY, 'd');
}

function isWithinAWeek(momentDate) {
	var REFERENCE = moment();
	var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
	return momentDate.isAfter(A_WEEK_OLD);
}

router.use('/:username', function(req, res, next) {
	Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, user) {
		if (err) return res.status(500).json({ 'error': err });
		req.user = user;
		next();
	});
});

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// rescue tonton 
router.post('/:username/rescue', function(req, res) {
	Mission.find({ username: req.user.username, name: 'rescue' }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneThisWeek = missions.length > 0 && isWithinAWeek(moment(dateFromObjectId(missions[0]._id.toString())));
		if (doneToday) {
			return res.status(400).json({ 'error': 'You already completed this mission today! **Oink!**' });
		} else {
			var amount = 10;
			var streak = doneYesterday;
			var double = Math.round(Math.random() * 10) == 0;
			if (streak) amount *= 2;
			if (double) amount *= 2;
			var today = new Date();
			if (today.getDay() == 6 || today.getDay() == 0) {
				amount *= 2;
			}
			var mission = new Mission({
				username: req.user.username, 
				name: 'rescue'
			});
			mission.save(function(err) {
				if (err) return res.status(500).json({ 'error': err });
				req.user.gold += amount;
				req.user.save(function(err) {
					if (err) return res.status(500).json({ 'error': err });
					return res.status(200).json({ streak: streak, double: double, amount: amount });
				});
			});
		}
	});
});

// gamble 
router.post('/:username/gamble', function(req, res) {
	Mission.find({ username: req.user.username, name: 'gamble' }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneThisWeek = missions.length > 0 && isWithinAWeek(moment(dateFromObjectId(missions[0]._id.toString())));
		if (doneToday) {
			return res.status(400).json({ 'error': 'You already completed this mission today! **Oink!**' });
		} else { 
			if (!req.body.amount || req.body.amount > req.user.gold) {
				return res.status(400).json({ 'error': 'You don\'t have this amount to bet! **Oink!**' });
			} 
			var amount = req.body.amount;
			var won = Math.round(Math.random()) == 0;
			var streak = doneYesterday && missions.length > 0 && missions[0].won;
			if (won) amount *= 2;
			else amount = -amount;
			if (won && streak) amount *= 2;
			var today = new Date();
			if (today.getDay() == 6 || today.getDay() == 0) {
				amount *= 2;
			}
			var mission = new Mission({
				username: req.user.username, 
				name: 'gamble', 
				won: won 
			});
			mission.save(function(err) {
				if (err) return res.status(500).json({ 'error': err });
				req.user.gold += amount;
				req.user.save(function(err) {
					if (err) return res.status(500).json({ 'error': err });
					return res.status(200).json({ streak: streak, won: won, amount: amount });
				});
			});
		} 
	});
});
 
// play
router.post('/:username/play', function(req, res) {
	Mission.find({ username: req.user.username, name: 'play' }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneThisWeek = missions.length > 0 && isWithinAWeek(moment(dateFromObjectId(missions[0]._id.toString())));
		if (doneToday) {
			return res.status(400).json({ 'error': 'You already completed this mission today! **Oink!**' });
		} else { 
			var aliases = [];
			for (var i = 0; i < req.user.alias.length; i++) {
				aliases.push(new RegExp(['^', escapeRegExp(req.user.alias[i]), '$'].join(''), 'i'));
			}  
			Game.find({ 'slots.username': { $in: aliases }, recorded: true }).sort('-_id').limit(1).exec(function(err, games) {
				if (games.length == 0 || !isToday(moment(dateFromObjectId(games[0]._id.toString())))) {
					return res.status(400).json({ 'error': 'You didn\'t play any game today! **Oink!**' });
				} else {
					var amount = 50;
					var xp = 10;
					var streak = doneYesterday;
					if (streak) {
						amount *= 2;
						xp *= 2;
					}
					var today = new Date();
					if (today.getDay() == 6 || today.getDay() == 0) {
						amount *= 2;
						xp *= 2;
					}
					var mission = new Mission({
						username: req.user.username,
						name: 'play'
					});
					mission.save(function(err) {
						if (err) return res.status(500).json({ 'error': err });
						req.user.gold += amount;
						req.user.xp += xp;
						var levelup = false;
						while (req.user.xp > 100) { 
							req.user.level += 1;
							req.user.xp -= 100;
							levelup = true;
						}
						req.user.save(function(err) {
							if (err) return res.status(500).json({ 'error': err });
							return res.status(200).json({ streak: streak, amount: amount, xp: xp, level: req.user.level, levelup: levelup });
						});
					}); 
				}
			});
		} 
	});
});

// win
router.post('/:username/win', function(req, res) {
	Mission.find({ username: req.user.username, name: 'win' }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneThisWeek = missions.length > 0 && isWithinAWeek(moment(dateFromObjectId(missions[0]._id.toString())));
		if (doneToday) {
			return res.status(400).json({ 'error': 'You already completed this mission today! **Oink!**' });
		} else {  
			var aliases = [];
			for (var i = 0; i < req.user.alias.length; i++) {
				aliases.push(new RegExp(['^', escapeRegExp(req.user.alias[i]), '$'].join(''), 'i'));
			}  
			Game.find({ 'slots.username': { $in: aliases }, 'slots.win': true, recorded: true }).sort('-_id').limit(1).exec(function(err, games) {
				if (games.length == 0 || !isToday(moment(dateFromObjectId(games[0]._id.toString())))) {
					return res.status(400).json({ 'error': 'You didn\'t win any game today! **Oink!**' });
				} else {
					var amount = 200;
					var xp = 20;
					var streak = doneYesterday;
					if (streak) {
						amount *= 2;
						xp *= 2;
					}
					var today = new Date();
					if (today.getDay() == 6 || today.getDay() == 0) {
						amount *= 2;
						xp *= 2;
					}
					var mission = new Mission({
						username: req.user.username,
						name: 'win'
					});
					mission.save(function(err) {
						if (err) return res.status(500).json({ 'error': err });
						req.user.gold += amount;
						req.user.xp += xp;
						var levelup = false;
						while (req.user.xp > 100) { 
							req.user.level += 1;
							req.user.xp -= 100;
							levelup = true;
						}
						req.user.save(function(err) {
							if (err) return res.status(500).json({ 'error': err });
							return res.status(200).json({ streak: streak, amount: amount, xp: xp, level: req.user.level, levelup: levelup });
						});
					}); 
				} 
			});
		} 
	});
});

// top
router.post('/:username/top', function(req, res) { 
	Mission.find({ username: req.user.username, name: 'top' }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneThisWeek = missions.length > 0 && isWithinAWeek(moment(dateFromObjectId(missions[0]._id.toString())));
		if (doneThisWeek) {
			return res.status(400).json({ 'error': 'You already completed this mission this week! **Oink!**' });
		} else { 
			Stat.aggregate([
			{
				$group: { 
					_id: '$alias',
					kills: { $sum: '$kills' },
					deaths: { $sum: '$deaths' },
					assists: { $sum: '$assists' },
					gpm: { $sum: '$gpm' },
					wins: { $sum: '$wins' },
					games: { $sum: '$games' } 
				}
			} 
			], function(err, stats) {
				if (err) return res.status(500).json(err);
				for (var i = 0; i < stats.length; i++) {
					stats[i].chanceWin = Calculator.AgrestiCoullLower(stats[i].games, stats[i].wins);
					stats[i].score = Calculator.calculateScore(stats[i]);
				} 
				stats.sort(function(a, b) {
					return b.score - a.score;
				});   
				if (stats[0]._id == req.user.username) {
					var amount = 1000;
					var xp = 100;
					var today = new Date();
					if (today.getDay() == 6 || today.getDay() == 0) {
						amount *= 2;
						xp *= 2;
					} 
					var mission = new Mission({
						username: req.user.username,
						name: 'top'
					});
					mission.save(function(err) {
						if (err) return res.status(500).json({ 'error': err });
						req.user.gold += amount;
						req.user.xp += xp;
						var levelup = false;
						while (req.user.xp > 100) { 
							req.user.level += 1;
							req.user.xp -= 100;
							levelup = true;
						}
						req.user.save(function(err) {
							if (err) return res.status(500).json({ 'error': err });
							return res.status(200).json({ amount: amount, xp: xp, level: req.user.level, levelup: levelup });
						}); 
					}); 
				} else {
					return res.status(400).json({ 'error': 'You are not the top! **Oink!**' });
				}
			});
		} 
	});
});

module.exports = router;
