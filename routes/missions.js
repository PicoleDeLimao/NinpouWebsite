'use strict';

var express = require('express');
var router = express.Router();
var moment = require('moment');
var Alias = require('../models/Alias'); 
var Mission = require('../models/Mission');
var Game = require('../models/Game');
var StatCalculator = require('./statcalculator');

function _dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

function _isToday(momentDate) {
	var REFERENCE = moment().utcOffset('+0200');
	var TODAY = REFERENCE.clone().startOf('day');
	return momentDate.utcOffset('+0200').isSame(TODAY, 'd');
}

function _isYesterday(momentDate) {
	var REFERENCE = moment().utcOffset('+0200');
	var YESTERDAY = REFERENCE.clone().subtract(1, 'days').startOf('day');
	return momentDate.utcOffset('+0200').isSame(YESTERDAY, 'd');
}

function _isWithinAWeek(momentDate) {
	var REFERENCE = moment().utcOffset('+0200');
	var A_WEEK_OLD = REFERENCE.clone().subtract(7, 'days').startOf('day');
	return momentDate.utcOffset('+0200').isAfter(A_WEEK_OLD);
}

router.use('/:username', function(req, res, next) {
	Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, user) {
		if (err) return res.status(500).json({ 'error': err });
		req.user = user;
		next();
	});
});

function _escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function _isMissionAvailable(username, name, frequency) {
	return new Promise(async function(resolve, reject) {
		try {
			var missions = await Mission.find({ username: username, name: name }).sort('-_id').limit(1);
			var doneToday = missions.length > 0 && _isToday(moment(_dateFromObjectId(missions[0]._id.toString())));
			var doneThisWeek = missions.length > 0 && _isWithinAWeek(moment(_dateFromObjectId(missions[0]._id.toString())));
			resolve(!((frequency == 'daily' && doneToday) || (frequency == 'weekly' && doneThisWeek)));
		} catch (err) {
			reject(err);
		}
	});
};

function _getAvailableMissions(username) {
	return new Promise(async function(resolve, reject) {
		try {
			var missions = [['rescue', 'daily'], ['gamble', 'daily'], ['rob', 'daily'], ['play', 'always'], ['win', 'always'], ['farm3k', 'daily'], ['kills20', 'daily'], ['deaths5', 'daily'], ['assists10', 'daily'], ['dailies', 'daily'], ['top', 'weekly']];
			var availableMissions = [];
			for (var i = 0; i < missions.length; i++) {
				if (await _isMissionAvailable(username, missions[i][0], missions[i][1])) {
					availableMissions.push(i);
				}
			}
			availableMissions.sort();
			for (var j = 0; j < availableMissions.length; j++) {
				availableMissions[j] = missions[availableMissions[j]][0];
			}
			return resolve(availableMissions);
		} catch (err) {
			reject(err);
		}
	});
};

function _areAllMissionsCompleted(missions) {
	var nonSRankMissions = ['rescue', 'farm3k', 'kills20', 'deaths5', 'assists10'];
	for (var i = 0; i < missions.length; i++) {
		for (var j = 0; j < nonSRankMissions.length; j++) {
			if (missions[i] == nonSRankMissions[j]) {
				return false;
			}
		}
	}
	return true; 
};

async function _dailyGameMission(req, res, name, condition, conditionError, goldReward, xpReward) {
	var missions = await Mission.find({ username: req.user.username, name: name }).sort('-_id').limit(1);
	var doneToday = missions.length > 0 && _isToday(moment(_dateFromObjectId(missions[0]._id.toString())));
	var doneYesterday = missions.length > 0 && _isYesterday(moment(_dateFromObjectId(missions[0]._id.toString())));
	if (doneToday) {
		return res.status(400).json({ error: 'You already completed this mission today! **Oink!**' });
	}
	var aliases = [];
	for (var i = 0; i < req.user.alias.length; i++) {
		aliases.push(new RegExp(['^', _escapeRegExp(req.user.alias[i]), '$'].join(''), 'i'));
	}  
	condition['slots']['$elemMatch']['username'] = { $in: aliases };
	condition['recorded'] = true;
	var games = await Game.find(condition).sort('-_id').limit(1);
	if (games.length == 0 || !_isToday(moment(_dateFromObjectId(games[0]._id.toString())))) {
		return res.status(400).json({ error: conditionError });
	}
	var amount = goldReward;
	if (req.user.summon == 'frog1') {
		amount += Math.floor(amount * 1.5);
	} else if (req.user.summon == 'frog2') {
		amount += Math.floor(amount * 2.5);
	} else if (req.user.summon == 'frog3') {
		amount += Math.floor(amount * 5.0);
	} else if (req.user.summon == 'dog' && ((Math.random() * 100) < 10)) {
		amount *= 20;
	}
	amount *= req.user.level / 10;
	var xp = xpReward;
	var streak = doneYesterday;
	if (streak) {
		amount *= 2;
		xp *= 2;
	}
	var today = moment().utcOffset('+0200');
	if (today.day() == 6 || today.day() == 0) {
		amount *= 2;
		xp *= 2;
	}
	var mission = new Mission({
		username: req.user.username,
		name: name
	});
	await mission.save();
	req.user.gold += amount;
	req.user.xp += xp;
	var levelup = false;
	while (req.user.xp > 100) { 
		req.user.level += 1;
		req.user.xp -= 100;
		levelup = true;
	}
	await req.user.save();
	return res.status(200).json({ streak: streak, amount: amount, xp: xp, level: req.user.level, levelup: levelup });
}

async function _rankMission(req, res, rank, minNumRankedGames, minAvgPoints, minNumKills, maxNumDeaths) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (alias.affiliation == 'none') return res.status(400).json({ error: 'You must join a village before doing a rank mission.' });
	var stats = await StatCalculator.getPlayerStats(req.params.username);
	if (stats.gamesRanked < minNumRankedGames) return res.status(400).json({ error: 'You must play at least ' + minNumRankedGames + ' ranked games to complete this mission.' });
	else if (stats.points < minAvgPoints) return res.status(400).json({ error: 'You must have at least ' + minAvgPoints + ' average points to complete this mission.' });
	var aliases = [];
	for (var i = 0; i < alias.alias.length; i++) {
		aliases.push(new RegExp(['^', _escapeRegExp(alias.alias[i]), '$'].join(''), 'i'));
	}  
	var condition = { slots: { $elemMatch: { username: { $in: aliases }, kills: { $gte: minNumKills }, deaths: { $lte: maxNumDeaths } } }, recorded: true, ranked: true };
	var games = await Game.find(condition).sort('-_id').limit(1);
	if (games.length == 0 || !_isToday(moment(_dateFromObjectId(games[0]._id.toString())))) {
		return res.status(400).json({ error: 'You didn\'t play any game with over ' + minNumKills + ' kills and less than ' + maxNumDeaths + ' deaths today.' });
	} else {
		alias.rank = rank;
		await alias.save();
		return res.status(200).send();
	} 
}

// rescue tonton 
router.post('/:username/rescue', async function(req, res) {
	var missions = await Mission.find({ username: req.user.username, name: 'rescue' }).sort('-_id').limit(1);
	var doneToday = missions.length > 0 && _isToday(moment(_dateFromObjectId(missions[0]._id.toString())));
	var doneYesterday = missions.length > 0 && _isYesterday(moment(_dateFromObjectId(missions[0]._id.toString())));
	if (doneToday) {
		return res.status(400).json({ error: 'You already completed this mission today! **Oink!**' });
	}
	var amount = 1000;
	var streak = doneYesterday;
	var double = Math.round(Math.random() * 10) == 0;
	/*if (req.user.summon == 'frog1') {
		amount += Math.floor(amount * 1.5);
	} else if (req.user.summon == 'frog2') {
		amount += Math.floor(amount * 2.5);
	} else if (req.user.summon == 'frog3') {
		amount += Math.floor(amount * 5.0);
	} else if (req.user.summon == 'dog' && ((Math.random() * 100) < 10)) {
		amount *= 20;
	}*/
	if (streak) amount *= 2;
	if (double) amount *= 2;
	var today = moment().utcOffset('+0200');
	if (today.day() == 6 || today.day() == 0) {
		amount *= 2;
	}
	var mission = new Mission({
		username: req.user.username, 
		name: 'rescue'
	});
	await mission.save();
	req.user.gold += amount;
	await req.user.save();
	return res.status(200).json({ streak: streak, double: double, amount: amount });
});

// gamble 
router.post('/:username/gamble', async function(req, res) {
	var missions = await Mission.find({ username: req.user.username, name: 'gamble' }).sort('-_id').limit(1);
	var doneToday = missions.length > 0 && _isToday(moment(_dateFromObjectId(missions[0]._id.toString())));
	if (doneToday) {
		return res.status(400).json({ error: 'You already completed this mission today! **Oink!**' });
	}
	if (!req.body.amount || req.body.amount > req.user.gold) {
		return res.status(400).json({ error: 'You don\'t have this amount to bet! **Oink!**' });
	} 
	var amount = Math.round(Math.min(req.body.amount, req.user.gold * 0.05));
	var missions = await _getAvailableMissions(req.user.username);
	var chance;
	if (_areAllMissionsCompleted(missions)) {
		chance = 75;
	} else {
		chance = 50;
	}
	if (req.user.summon == 'snake1') {
		chance += 10;
	} else if (req.user.summon == 'snake2') {
		chance += 15;
	} else if (req.user.summon == 'snake3') {
		chance += 25;
	}
	var won = Math.round(Math.random() * 100) < chance; 
	if (won) amount *= 2;
	else amount = -amount; 
	var mission = new Mission({
		username: req.user.username, 
		name: 'gamble', 
		won: won 
	});
	await mission.save();
	req.user.gold += amount;
	await req.user.save();
	return res.status(200).json({ streak: false, won: won, amount: amount });
});
 
// rob 
router.post('/:username/rob', async function(req, res) {
	var missions = await Mission.find({ username: req.user.username, name: 'rob' }).sort('-_id').limit(1);
	var doneToday = missions.length > 0 && _isToday(moment(_dateFromObjectId(missions[0]._id.toString())));
	if (doneToday) {
		return res.status(400).json({ error: 'You already completed this mission today! **Oink!**' });
	} 
	var anotherUser = await Alias.findOne({ username: req.body.user.toLowerCase() });
	if (!anotherUser) return res.status(404).json({ error: 'User not found.' });
	var amount = Math.round(Math.min(req.user.gold * 0.05, anotherUser.gold * 0.05));
	var chanceSuccess = 50;
	if (req.user.summon == 'hawk') {
		chanceSuccess += 10;
	} 
	if (anotherUser.summon == 'crow') {
		chanceSuccess -= 15;
	}
	var won = Math.round(Math.random() * 100) < chanceSuccess;
	if (won) {
		req.user.gold += amount;
		anotherUser.gold -= amount;
	} else {
		req.user.gold -= amount;
		anotherUser.gold += amount;
	}
	var mission = new Mission({
		username: req.user.username, 
		name: 'rob', 
		won: won 
	}); 
	await mission.save();
	await req.user.save();
	await anotherUser.save();
	return res.status(200).json({ streak: false, won: won, amount: amount });
});
 
// dailies  
router.post('/:username/dailies', async function(req, res) {
	var missions = await Mission.find({ username: req.user.username, name: 'dailies' }).sort('-_id').limit(1);
	var doneToday = missions.length > 0 && _isToday(moment(_dateFromObjectId(missions[0]._id.toString())));
	var doneYesterday = missions.length > 0 && _isYesterday(moment(_dateFromObjectId(missions[0]._id.toString())));
	if (doneToday) {
		return res.status(400).json({ error: 'You already completed this mission today! **Oink!**' });
	}
	var missions = await _getAvailableMissions(req.user.username);
	if (!_areAllMissionsCompleted(missions)) {
		return res.status(400).json({ error: 'You haven\'t completed all daily missions! **Oink!**' });
	}
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'User not found.' });
	var amount; 
	if (alias.rank == 'chunnin') {
		amount = 2000;
	} else if (alias.rank == 'tokubetsu jounin') {
		amount = 4000;
	} else if (alias.rank == 'jounin') {
		amount = 8000;
	} else if (alias.rank == 'anbu') {
		amount = 16000;
	} else if (alias.rank == 'kage') {
		amount = 24000;
	} else {
		amount = 1000;
	}
	if (alias.summon == 'frog1') {
		amount += Math.floor(amount * 1.5);
	} else if (alias.summon == 'frog2') {
		amount += Math.floor(amount * 2.5);
	} else if (alias.summon == 'frog3') {
		amount += Math.floor(amount * 5.0);
	} else if (alias.summon == 'dog' && ((Math.random() * 100) < 10)) {
		amount *= 20;
	}
	amount *= req.user.level / 10;
	var xp = 50;
	var streak = doneYesterday;
	if (streak) {
		amount *= 2;
		xp *= 2;
	}
	var today = moment().utcOffset('+0200');
	if (today.day() == 6 || today.day() == 0) {
		amount *= 2;
		xp *= 2;
	}
	var mission = new Mission({
		username: req.user.username,
		name: 'dailies'
	});
	await mission.save();
	req.user.gold += amount;
	req.user.xp += xp;
	var levelup = false;
	while (req.user.xp > 100) { 
		req.user.level += 1;
		req.user.xp -= 100;
		levelup = true;
	}
	await req.user.save();
	return res.status(200).json({ streak: streak, amount: amount, xp: xp, level: req.user.level, levelup: levelup });
});
 
// play
router.post('/:username/play', async function(req, res) {
	var aliases = [];
	for (var i = 0; i < req.user.alias.length; i++) {
		aliases.push(new RegExp(['^', _escapeRegExp(req.user.alias[i]), '$'].join(''), 'i'));
	}  
	var condition = { slots: { $elemMatch: { username: { $in: aliases } } }, missionPlayed: { $nin: [req.params.username.toLowerCase()] }, recorded: true };
	var games = await Game.find(condition).sort('-_id').limit(1);
	if (games.length == 0 || !_isToday(moment(_dateFromObjectId(games[0]._id.toString())))) {
		return res.status(400).json({ 'error': 'You didn\'t play a game.' });
	}
	var amount = 50;
	if (req.user.summon == 'frog1') {
		amount += Math.floor(amount * 1.5);
	} else if (req.user.summon == 'frog2') {
		amount += Math.floor(amount * 2.5);
	} else if (req.user.summon == 'frog3') {
		amount += Math.floor(amount * 5.0);
	} else if (req.user.summon == 'dog' && ((Math.random() * 100) < 10)) {
		amount *= 20;
	}
	amount *= req.user.level / 10;
	var xp = 10;
	var today = moment().utcOffset('+0200');
	if (today.day() == 6 || today.day() == 0) {
		amount *= 2;
		xp *= 2;
	}
	games[0].missionPlayed.push(req.params.username.toLowerCase());
	await games[0].save();
	var mission = new Mission({
		username: req.user.username,
		name: 'play'
	});
	await mission.save();
	req.user.gold += amount;
	req.user.xp += xp;
	var levelup = false;
	while (req.user.xp > 100) { 
		req.user.level += 1;
		req.user.xp -= 100;
		levelup = true;
	}
	await req.user.save();
	return res.status(200).json({ streak: false, amount: amount, xp: xp, level: req.user.level, levelup: levelup });
});

// win
router.post('/:username/win', async function(req, res) {
	var aliases = [];
	for (var i = 0; i < req.user.alias.length; i++) {
		aliases.push(new RegExp(['^', _escapeRegExp(req.user.alias[i]), '$'].join(''), 'i'));
	}  
	var condition = { slots: { $elemMatch: { username: { $in: aliases }, win: true } }, missionWon: { $nin: [req.params.username.toLowerCase()] }, recorded: true };
	var games = await Game.find(condition).sort('-_id').limit(1);
	if (games.length == 0 || !_isToday(moment(_dateFromObjectId(games[0]._id.toString())))) {
		return res.status(400).json({ 'error': 'You didn\'t win a game.' });
	}
	var amount = 200;
	if (req.user.summon == 'frog1') {
		amount += Math.floor(amount * 1.5);
	} else if (req.user.summon == 'frog2') {
		amount += Math.floor(amount * 2.5);
	} else if (req.user.summon == 'frog3') {
		amount += Math.floor(amount * 5.0);
	} else if (req.user.summon == 'dog' && ((Math.random() * 100) < 10)) {
		amount *= 20;
	}
	amount *= req.user.level / 10;
	var xp = 20;
	var today = moment().utcOffset('+0200');
	if (today.day() == 6 || today.day() == 0) {
		amount *= 2;
		xp *= 2;
	}
	games[0].missionWon.push(req.params.username.toLowerCase());
	await games[0].save();
	var mission = new Mission({
		username: req.user.username,
		name: 'play'
	});
	await mission.save();
	req.user.gold += amount;
	req.user.xp += xp;
	var levelup = false;
	while (req.user.xp > 100) { 
		req.user.level += 1;
		req.user.xp -= 100;
		levelup = true;
	}
	await req.user.save();
	return res.status(200).json({ streak: false, amount: amount, xp: xp, level: req.user.level, levelup: levelup });
});

// farm 3k
router.post('/:username/farm3k', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'User not found.' });
	var threshold, goldReward; 
	if (alias.rank == 'chunnin') {
		threshold = 20;
		goldReward = 1000;
	} else if (alias.rank == 'tokubetsu jounin') {
		threshold = 22;
		goldReward = 1500;
	} else if (alias.rank == 'jounin') {
		threshold = 25;
		goldReward = 2000;
	} else if (alias.rank == 'anbu') {
		threshold = 27;
		goldReward = 2500;
	} else if (alias.rank == 'kage') {
		threshold = 30;
		goldReward = 3000;
	} else {
		threshold = 18;
		goldReward = 500;
	}
	if (alias.summon == 'slug1') {
		threshold -= 1;
	} else if (alias.summon == 'slug2') {
		threshold -= 2;
	}
	_dailyGameMission(req, res, 'farm3k', { 'slots': { '$elemMatch': { 'gpm': { $gte: threshold } } } }, 'You didn\'t play any game with over ' + (threshold * 100) + ' gpm today! **Oink!**', goldReward, 20);
});
 
// kills 20
router.post('/:username/kills20', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'User not found.' });
	var threshold, goldReward; 
	if (alias.rank == 'chunnin') {
		threshold = 15;
		goldReward = 1000;
	} else if (alias.rank == 'tokubetsu jounin') {
		threshold = 17;
		goldReward = 1500;
	} else if (alias.rank == 'jounin') {
		threshold = 20;
		goldReward = 3000;
	} else if (alias.rank == 'anbu') {
		threshold = 23;
		goldReward = 5000;
	} else if (alias.rank == 'kage') {
		threshold = 25;
		goldReward = 10000;
	} else {
		threshold = 10;
		goldReward = 500;
	}
	if (alias.summon == 'slug1') {
		threshold -= 1;
	} else if (alias.summon == 'slug2') {
		threshold -= 2;
	}
	_dailyGameMission(req, res, 'kills20', { 'slots': { '$elemMatch': { 'kills': { $gte: threshold } } } }, 'You didn\'t play any game with over ' + threshold + ' kills today! **Oink!**', goldReward, 20);
});

// deaths 5 
router.post('/:username/deaths5', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'User not found.' });
	var threshold, goldReward; 
	if (alias.rank == 'chunnin') {
		threshold = 14;
		goldReward = 1000;
	} else if (alias.rank == 'tokubetsu jounin') {
		threshold = 13;
		goldReward = 1500;
	} else if (alias.rank == 'jounin') {
		threshold = 12;
		goldReward = 3000;
	} else if (alias.rank == 'anbu') {
		threshold = 11;
		goldReward = 5000;
	} else if (alias.rank == 'kage') {
		threshold = 10;
		goldReward = 10000;
	} else {
		threshold = 15;
		goldReward = 500;
	}
	if (alias.summon == 'slug1') {
		threshold += 1;
	} else if (alias.summon == 'slug2') {
		threshold += 2;
	}
	_dailyGameMission(req, res, 'deaths5', { 'slots': { '$elemMatch': { 'deaths': { $lte: threshold } } } }, 'You didn\'t play any game with less ' + threshold + ' deaths today! **Oink!**', goldReward, 20);
});

// assists 20
router.post('/:username/assists10', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'User not found.' });
	var threshold, goldReward; 
	if (alias.rank == 'chunnin') {
		threshold = 7;
		goldReward = 1000;
	} else if (alias.rank == 'tokubetsu jounin') {
		threshold = 8;
		goldReward = 1500;
	} else if (alias.rank == 'jounin') {
		threshold = 9;
		goldReward = 3000;
	} else if (alias.rank == 'anbu') {
		threshold = 10;
		goldReward = 5000;
	} else if (alias.rank == 'kage') {
		threshold = 11;
		goldReward = 10000;
	} else {
		threshold = 6;
		goldReward = 500;
	}
	if (alias.summon == 'slug1') {
		threshold -= 1;
	} else if (alias.summon == 'slug2') {
		threshold -= 2;
	}
	_dailyGameMission(req, res, 'assists10', { 'slots': { '$elemMatch': { 'assists': { $gte: threshold } } } }, 'You didn\'t play any game with over ' + threshold + ' assists today! **Oink!**', goldReward, 20);
});

// top
router.post('/:username/top', async function(req, res) { 
	var missions = await Mission.find({ username: req.user.username, name: 'top' }).sort('-_id').limit(1);
	var doneThisWeek = missions.length > 0 && _isWithinAWeek(moment(_dateFromObjectId(missions[0]._id.toString())));
	if (doneThisWeek) {
		return res.status(400).json({ 'error': 'You already completed this mission this week! **Oink!**' });
	} 
	var stats = await StatCalculator.getRakingOfPlayers();
	stats.sort(function(a, b) { 
		return a.ranking['score'] - b.ranking['score'];
	});
	if (stats[0]._id != req.user.username) {
		return res.status(400).json({ 'error': 'You are not the top! **Oink!**' });
	}
	var amount = 100000;
	var xp = 100;
	var mission = new Mission({
		username: req.user.username,
		name: 'top'
	});
	amount *= req.user.level / 10;
	await mission.save();
	req.user.gold += amount;
	req.user.xp += xp;
	var levelup = false;
	while (req.user.xp > 100) { 
		req.user.level += 1;
		req.user.xp -= 100;
		levelup = true;
	}
	await req.user.save();
	return res.status(200).json({ amount: amount, xp: xp, level: req.user.level, levelup: levelup });
});

router.get('/:username/available', async function(req, res) {
	var missions = await _getAvailableMissions(req.user.username);
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	return res.status(200).json({ missions: missions, completed: _areAllMissionsCompleted(missions), affiliation: alias.affiliation });
});

router.post('/:username/rank/genin', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	alias.rank = 'genin';
	await alias.save();
	res.send();
});

router.post('/:username/rank/chunnin', function(req, res) { 
	_rankMission(req, res, 'chunnin', 10, 50, 15, 15);
});

router.post('/:username/rank/tokubetsu', function(req, res) { 
	_rankMission(req, res, 'tokubetsu jounin', 25, 100, 20, 12);
});

router.post('/:username/rank/jounin', function(req, res) { 
	_rankMission(req, res, 'jounin', 35, 150, 30, 10);
});

router.post('/:username/rank/anbu', function(req, res) { 
	_rankMission(req, res, 'jounin', 50, 200, 35, 8);
});

router.post('/:username/rank/kage', async function(req, res) { 
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (alias.affiliation == 'none') return res.status(400).json({ error: 'You must join a village before doing a rank mission.' });
	var stats = await StatCalculator.getRakingOfPlayers();
	stats.sort(function(a, b) { 
		return a.ranking['score'] - b.ranking['score'];
	});
	for (var i = 0; i < stats.length; i++) {
		var anotherAlias = await Alias.findOne({ username: stats[i]._id });
		if (anotherAlias && anotherAlias.affiliation == alias.affiliation) {
			if (anotherAlias.username == alias.username) {
				alias.rank = 'kage';
				await alias.save();
				return res.status(200).send();
			} else {
				return res.status(400).json({ error: 'You are not the top player of your village.' });
			}
		}
	}
});

module.exports = router;
