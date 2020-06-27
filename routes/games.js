'use strict';

var mongoose = require('mongoose');
var express = require('express');
var https = require('https');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Alias = require('../models/Alias');
var Hero = require('../models/Hero');
var BalanceCalculator = require('./balancecalculator');
var StatCalculator = require('./statcalculator');

router.get('/', function(req, response) {
	var request = https.request({ host: 'wc3maps.com', path: '/vue/gamelist.php?_=' + (new Date()).getTime(), method: 'GET', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) { 
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				return response.status(500).json({ error:'Couldn\'t fetch games.' }); 
			} else {
				try {
					var games = JSON.parse(body);
					var ninpouGames = [];
					for (var i = 0; i < games.length; i++) {
						if (games[i].name.toLowerCase().indexOf('ninpou') != -1) {
							ninpouGames.push(games[i]);
						}
					}
					return response.status(200).json(ninpouGames);
				} catch (err) {
					return response.status(500).json({ error:'Error while parsing game:' + err });
				}
			}
		});
	}); 
	request.on('error', function(err) {
		return response.status(500).json({ error: 'Could not get game list.' }); 
	});
	request.end();
});

router.get('/recorded', function(req, res) {
	var page = Math.max(0, (parseInt(req.query.page, 0) - 1));
	Game.find({ recorded: true }).sort({ _id: -1 }).skip(20*page).limit(20).exec(function(err, games) {
		if (err) return res.status(500).json({ error:err });
		return res.json(games);
	});
});
 
function getPlayerStats(players, callback) {
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
	(async function next(i) {
		if (i == players.length) {
			var regressions =  { };
			for (var i = 0; i < slots.length; i++) {
				regressions[slots[i].username] = slots[i];
			}
			callback(slots, regressions);
		} else {
			StatCalculator.getPlayerStats(players[i], function(err, stat, model) {
				if (err) model = null; 
				if (model == null) {
					stat = {
						username: players[i],
						realm: 'Unknown'
					}
				} else {
					model.alias = stat._id;
					model.username = stat._id;
					model.realm = 'Unknown';
					model = JSON.parse(JSON.stringify(model));
				}
				slots[i] = model;
				next(i + 1);
			}, true);
		}
	})(0);
}

router.post('/balance', function(req, res) {
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
	getPlayerStats(players, function(slots, regressions) {
		game.slots = slots;
		BalanceCalculator.getOptimalBalance(game.slots, regressions, true, function(err, swaps) {
			if (err) return res.status(500).json({ error: err });
			for (var j = 0; j < swaps.length; j++) {
				var tmp = game.slots[swaps[j][0]];
				game.slots[swaps[j][0]] = game.slots[swaps[j][1]];
				game.slots[swaps[j][1]] = tmp;
			}
			for (var i = 0; i < game.slots.length; i++) {
				var stats = regressions[game.slots[i].username];
				game.slots[i].points = stats.mean;
				game.slots[i].points_mean = stats.mean;
				game.slots[i].points_std = stats.std;
				game.slots[i].error = stats.std;
			}
			game.balance = 1;
			return res.json({ game: game, swaps: swaps });
		}); 
	});
});

router.get('/:game_id', function(req, res) {
	Game.findOne({ id: req.params.game_id }).lean().exec(function(err, game) {
		if (err) return res.status(500).json({ error:err });
		else if (!game) return res.status(404).json({ error:'Game not found.' });
		if (game.recorded) { 
			(function getHeroOnSlot(slot) {
				if (slot == game.slots.length) {
					var players = [];
					for (var i = 0; i < game.slots.length; i++) {
						players.push(game.slots[i].username);
					}
					getPlayerStats(players, function(slots, regressions) {
						BalanceCalculator.calculateBalanceFactor(slots, regressions, function(err, balanceFactor) {
							if (err) return res.status(500).json({ error: err });
							game.balance = balanceFactor;
							return res.json(game);
						});
					});
				} else {
					Hero.findOne({ id: game.slots[slot].hero }, function(err, hero) {
						if (err) return res.status(500).json({ error:err });
						game.slots[slot].hero = hero || game.slots[slot].hero;
						getHeroOnSlot(slot + 1);
					});
				}
			})(0);
		} else {
			return res.json(game);
		}
	});
});

module.exports = router;
