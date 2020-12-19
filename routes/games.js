'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var HeroStat = require('../models/HeroStat');
var Game = require('../models/Game');
var Hero = require('../models/Hero');
var Calculator = require('./calculator');
var BalanceCalculator = require('./balancecalculator');
var StatCalculator = require('./statcalculator');
var Decoder = require('./decoder');
var Code = require('../models/Code');

function _getPlayerStats(players) {
	return new Promise(async function (resolve, reject) {
		try {
			var slots = [];
			for (var i = 0; i < players.length; i++) {
				slots.push({
					username: players[i],
					realm: 'Unknown'
				});
			}
			for (var i = players.length; i < 9; i++) {
				slots.push({
					username: null,
					realm: 'Unknown'
				});
			}
			for (var i = 0; i < players.length; i++) {
				var model;
				try {
					model = await StatCalculator.getPlayerStats(players[i]);
					model.alias = players[i];
					model.username = players[i];
					model.realm = 'Unknown';
				} catch (err) {
					console.error(err);
					model = {
						username: players[i],
						realm: 'Unknown'
					};
				}
				slots[i] = model;
			}
			resolve(slots);
		} catch (err) {
			reject(err);
		}
	});
}

function _getPlayerAlias(alias, callback) {
	return new Promise(async function(resolve, reject) {
		try {
			var alias = await Alias.findOne({ alias: alias.toLowerCase() });
			if (!alias) return resolve(null);
			resolve(alias.username);
		} catch (err) {
			reject(err);
		}
	});
};

function _saveHeroStats(game) {
	return new Promise(async function(resolve, reject) {
		try {
			for (var slot = 0; slot < Math.min(9, game.slots.length); slot++) {
				if (game.slots[slot].state == 'EMPTY' || game.slots[slot].hero == 0) continue;
				var stat = await HeroStat.findOne({ hero: game.slots[slot].hero });
				if (!stat) stat = new HeroStat({
					hero: game.slots[slot].hero
				});
				stat.kills += game.slots[slot].kills;
				stat.deaths += game.slots[slot].deaths;
				stat.assists += game.slots[slot].assists;
				stat.points += game.slots[slot].points;
				stat.gpm += game.slots[slot].gpm;
				if (game.slots[slot].win) stat.wins += 1;
				stat.games += 1;
				stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
				stat.score = Calculator.calculateScore(stat);
				await stat.save();
			}
			resolve();
		} catch (err) {
			reject(err);
		}
	});
}

function _savePlayerGames(game) {
	return new Promise(async function(resolve, reject) {
		try {
			for (var slot = 0; slot < Math.min(0, game.slots.length); slot++) {
				if (game.slots[slot].state == 'EMPTY' || (game.slots[slot].kills == 0 && game.slots[slot].deaths == 0 && game.slots[slot].assists == 0)) continue;
				var stat = await Stat.findOne({ username: game.slots[slot].username.toLowerCase() });
				if (!stat) stat = new Stat({
					username: game.slots[slot].username.toLowerCase(),
					games: 0
				});
				stat.games += 1; 
				await stat.save();
			}
			resolve();
		} catch (err) {
			reject(err);
		}
	});
}

function _savePlayerStats(game) {
	return new Promise(async function(resolve, reject) {
		try {
			for (var slot = 0; slot < Math.min(0, game.slots.length); slot++) {
				if (game.slots[slot].state == 'EMPTY' || (game.slots[slot].kills == 0 && game.slots[slot].deaths == 0 && game.slots[slot].assists == 0)) continue;
				var stat = await Stat.findOne({ username: game.slots[slot].username.toLowerCase() });
				if (!stat) stat = new Stat({
					username: game.slots[slot].username.toLowerCase(),
					kills: game.slots[slot].kills,
					deaths: game.slots[slot].deaths,
					assists: game.slots[slot].assists,
					points: game.slots[slot].points,
					gpm: game.slots[slot].gpm,
					gamesRanked: 0
				});
				var alpha = Math.min(1 - 1.0 / (stat.gamesRanked + 1), 0.95);
				var beta = 1 - alpha; 
				stat.kills = stat.kills * alpha + game.slots[slot].kills * beta
				stat.deaths = stat.deaths * alpha + game.slots[slot].deaths * beta;
				stat.assists = stat.assists * alpha + game.slots[slot].assists * beta;
				stat.points = stat.points * alpha + game.slots[slot].points * beta;
				stat.gpm = stat.gpm * alpha + game.slots[slot].gpm * beta;
				if (game.slots[slot].win) stat.wins += 1;
				stat.gamesRanked += 1; 
				stat.chanceWin = Calculator.AgrestiCoullLower(stat.gamesRanked, stat.wins);
				stat.score = Calculator.calculateScore(stat);
				stat.lastRankedGame = game.createdAt;
				await stat.save();
			}
			resolve();
		} catch (err) {
			reject(err);
		}
	});
}

function _getPlayerPoints(game) {
	return new Promise(async function(resolve, reject) {
		try {
			var points = { };
			for (var slot = 0; slot < Math.min(0, game.slots.length); slot++) {
				if (game.slots[slot].state == 'EMPTY') continue;
				var username;
				try {
					username = await _getPlayerAlias(game.slots[slot].username.toLowerCase());
				} catch (err) {
					username = game.slots[slot].username.toLowerCase();
				}
				stats = await StatCalculator.getPlayerStats(username);
				points[stat._id] = stat.stats.mean;
			}
			resolve(points);
		} catch (err) {
			reject(err);
		}
	});
}

router.post('/', async function (req, res) {
	try {
		var game = new Game({
			id: mongoose.Types.ObjectId().toString(),
			createdAt: new Date(),
			gamename: 'Naruto Ninpou Reforged',
			map: 'Unknown',
			owner: 'None',
			duration: '00:00:00',
			slots: [],
			players: 0,
			progress: false,
			recorded: true,
			recordable: true,
			ranked: false
		});
		var body = req.body.contents.replace(/\n/g, '').replace(/\r/g, '').trim();
		if (body.length < 11) return res.status(400).json({ error: 'Invalid code. Reason: 0' });
		var code = await Code.findOne({ code: body });
		if (code) return res.status(400).json({ error: 'This game was already recorded.' });
		game = await Decoder.decodeGame(body, game);
		if (game.players != 9) return res.status(400).json({ error: 'You can only record games with 9 players.' });
		else if (parseInt(game.duration.split(':')[0]) == 0 && parseInt(game.duration.split(':')[1]) < 40) return res.status(400).json({ error: 'You can only record games past 40 minutes.' });
		else if (parseInt(game.duration.split(':')[0]) > 0) return res.status(400).json({ error: 'You can only record games between 40 and 60 minutes.' });
		var code = new Code({ code: body });
		await code.save();
		await game.save();
		await _savePlayerGames(game);
		await _saveHeroStats(game);
		return res.status(200).json(game);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err });
	}
});

router.post('/ranked/:game_id', async function (req, res) {
	var game = await Game.findOne({ id: req.params.game_id });
	if (!game) return res.status(404).json({ error: 'Game not found.' });
	else if (game.ranked) return res.status(400).json({ error: 'This game is already ranked.' });
	game.ranked = true;
	var players = [];
	for (var i = 0; i < game.slots.length; i++) {
		players.push(game.slots[i].username);
	}
	var slots = await _getPlayerStats(players);
	game.balance = await BalanceCalculator.calculateBalanceFactor(slots);
	await game.save();
	var oldPoints = await _getPlayerPoints(game);
	await _savePlayerStats(game);
	var newPoints = await _getPlayerPoints(game);
	var changes = [];
	for (var username in oldPoints) {
		changes.push({ alias: username, oldPoints: oldPoints[username], newPoints: newPoints[username] });
	}
	return res.status(200).json({ changes: changes });
});

router.post('/balance', async function (req, res) {
	var players = req.body.players;
	for (var i = players.length - 1; i >= 0; i--) {
		if (players[i].trim() == "") {
			players.splice(i, 1);
		}
	}
	var game = {
		createdAt: new Date(),
		gamename: 'Naruto Ninpou Reforged',
		map: 'Unknown',
		owner: 'None',
		duration: '00:00:00',
		slots: [],
		players: players.length,
		progress: false,
		recorded: false,
		recordable: true,
		ranked: false
	};
	game.slots = await _getPlayerStats(players);
	var swaps = await BalanceCalculator.getOptimalBalance(game.slots, true);
	for (var i = 0; i < swaps.length; i++) {
		var tmp = game.slots[swaps[i][0]];
		game.slots[swaps[i][0]] = game.slots[swaps[i][1]];
		game.slots[swaps[i][1]] = tmp;
	}
	for (var i = 0; i < game.slots.length; i++) {
		if (game.slots[i].stats) {
			var stats = game.slots[i].stats;
			game.slots[i].points = stats.mean;
			game.slots[i].error = stats.std;
		}
	}
	game.balance = 1;
	return res.json({ game: game, swaps: swaps });
});

router.get('/recorded', async function (req, res) {
	var page = Math.max(0, (parseInt(req.query.page, 0) - 1));
	var games = await Game.find({ recorded: true }).sort({ _id: -1 }).skip(20 * page).limit(20);
	return res.json(games);
});

router.get('/:game_id', async function (req, res) {
	var game = await Game.findOne({ id: req.params.game_id }).lean();
	if (!game) return res.status(404).json({ error: 'Game not found.' });
	if (!game.recorded) return res.json(game);
	for (var slot = 0; slot < game.slots.length; slot++) {
		var hero = await Hero.findOne({ id: game.slots[slot].hero });
		game.slots[slot].hero = hero || game.slots[slot].hero;
	}
	if (!game.ranked) {
		var players = [];
		for (var i = 0; i < game.slots.length; i++) {
			players.push(game.slots[i].username);
		}
		var slots = await _getPlayerStats(players);
		var balanceFactor = await BalanceCalculator.calculateBalanceFactor(slots);
		game.balance = balanceFactor;
		return res.json(game);
	}
});

module.exports = router;
