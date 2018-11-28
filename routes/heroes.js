'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Hero = require('../models/Hero');
var Game = require('../models/Game');
var Alias = require('../models/Alias');
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
 
function getContainingAlias(alias, username) {
	for (var i = 0; i < alias.length; i++) {
		for (var j = 0; j < alias[i].alias.length; j++) {
			if (username == alias[i].alias[j]) {
				return i;
			}
		}
	}
	return -1;
}

router.get('/:name', function(req, res) {  
	StatCalculator.getHeroStats(req.params.name, function(err, stats) {
		if (err) return res.status(400).json({ 'error': err });
		StatCalculator.getAllHeroesRanking(function(err, heroes) {
			if (err) return res.status(400).json({ 'error': err });
			stats = StatCalculator.getRankingPositions(heroes, stats); 
			var timePeriod = moment().subtract(6, 'month').toDate();
			Game.aggregate([
				{
					$unwind: '$slots',
				},
				{
					$match: {
						'createdAt': { $gt: timePeriod },
						'slots.hero': stats.hero.id,
						'recorded': true,
						'balance_factor': { $gt: 0.95 }
					}
				},
				{
					$group: {
						_id: '$slots.username',
						kills: { $sum: '$slots.kills' },
						deaths: { $sum: '$slots.deaths' },
						assists: { $sum: '$slots.assists' },
						gpm: { $sum: '$slots.gpm' },
						wins: { $sum: { $cond: ['$slots.win', 1, 0] } },
						games: { $sum: 1 }
					}
				}
			]).exec(function(err, games) {
				Alias.find({ }, function(err, alias) {
					var gamesAggregated = { };
					for (var i = 0; i < games.length; i++) {
						var containingAlias = getContainingAlias(alias, games[i]._id.toLowerCase());
						if (containingAlias == -1) {
							gamesAggregated[games[i]._id.toLowerCase()] = games[i];
						} else {
							if (!(alias[containingAlias].username in gamesAggregated)) {
								gamesAggregated[alias[containingAlias].username] = games[i];
							} else {
								gamesAggregated[alias[containingAlias].username].kills += games[i].kills;
								gamesAggregated[alias[containingAlias].username].deaths += games[i].deaths;
								gamesAggregated[alias[containingAlias].username].assists += games[i].assists;
								gamesAggregated[alias[containingAlias].username].gpm += games[i].gpm;
								gamesAggregated[alias[containingAlias].username].wins += games[i].wins;
								gamesAggregated[alias[containingAlias].username].games += games[i].games;
							}
						}
					}
					var newGamesAggregated = [];
					for (var alias in gamesAggregated) {
						var obj = {
							alias: alias, 
							kills: gamesAggregated[alias].kills / gamesAggregated[alias].games, 
							deaths: gamesAggregated[alias].deaths / gamesAggregated[alias].games,
							assists: gamesAggregated[alias].assists / gamesAggregated[alias].games,
							gpm: gamesAggregated[alias].gpm / gamesAggregated[alias].games, 
							wins: gamesAggregated[alias].wins,
							games: gamesAggregated[alias].games
						};
						obj.points = obj.kills * 10 + obj.assists * 2 - obj.deaths * 5;
						if (obj.games >= 3) {
							newGamesAggregated.push(obj);
						}
					}
					newGamesAggregated.sort(function(a, b) {
						return b.points - a.points;
					});
					return res.json({ stats: stats, bestPlayers: newGamesAggregated.slice(0, 5), numPlayers: newGamesAggregated.length });
				});
			});
		});
	});  
});
 
module.exports = router;
