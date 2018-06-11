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

function dailyGameMission(req, res, name, condition, conditionError, goldReward, xpReward) {
	Mission.find({ username: req.user.username, name: name }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
		if (doneToday) {
			return res.status(400).json({ 'error': 'You already completed this mission today! **Oink!**' });
		} else {  
			var aliases = [];
			for (var i = 0; i < req.user.alias.length; i++) {
				aliases.push(new RegExp(['^', escapeRegExp(req.user.alias[i]), '$'].join(''), 'i'));
			}  
			condition.slots['username'] = { $in: aliases };
			condition['recorded'] = true;
			Game.find(condition).sort('-_id').limit(1).exec(function(err, games) {
				if (games.length == 0 || !isToday(moment(dateFromObjectId(games[0]._id.toString())))) {
					return res.status(400).json({ 'error': conditionError });
				} else {
					var amount = goldReward;
					var xp = xpReward;
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
						name: name
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
}

// rescue tonton 
router.post('/:username/rescue', function(req, res) {
	Mission.find({ username: req.user.username, name: 'rescue' }).sort('-_id').limit(1).exec(function(err, missions) {
		var doneToday = missions.length > 0 && isToday(moment(dateFromObjectId(missions[0]._id.toString())));
		var doneYesterday = missions.length > 0 && isYesterday(moment(dateFromObjectId(missions[0]._id.toString())));
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
		if (doneToday) {
			return res.status(400).json({ 'error': 'You already completed this mission today! **Oink!**' });
		} else { 
			req.body.amount = Math.max(req.body.amount, 1000);
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
	dailyGameMission(req, res, 'play', { }, 'You didn\'t play any game today! **Oink!**', 50, 10);
});

// win
router.post('/:username/win', function(req, res) {
	dailyGameMission(req, res, 'win', { 'slots': { 'win': true } }, 'You didn\'t win any game today! **Oink!**', 200, 20);
});

// farm 3k
router.post('/:username/farm3k', function(req, res) {
	dailyGameMission(req, res, 'farm3k', { 'slots': { 'gpm': $gte: 30 } }, 'You didn\'t play any game with over 3k gpm today! **Oink!**', 500, 20);
});

// kills 20
router.post('/:username/kills20', function(req, res) {
	dailyGameMission(req, res, 'kills20', { 'slots': { 'kills': $gte: 30 } }, 'You didn\'t play any game with over 20 kills today! **Oink!**', 500, 20);
});

// deaths 5 
router.post('/:username/deaths5', function(req, res) {
	dailyGameMission(req, res, 'deaths5', { 'slots': { 'deaths': $lte: 5 } }, 'You didn\'t play any game with less 5 deaths today! **Oink!**', 500, 20);
});

// assists 20
router.post('/:username/assists20', function(req, res) {
	dailyGameMission(req, res, 'assists20', { 'slots': { 'assists': $gte: 20 } }, 'You didn\'t play any game with over 20 assists today! **Oink!**', 500, 20);
});

// top
router.post('/:username/top', function(req, res) { 
	Mission.find({ username: req.user.username, name: 'top' }).sort('-_id').limit(1).exec(function(err, missions) {
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
