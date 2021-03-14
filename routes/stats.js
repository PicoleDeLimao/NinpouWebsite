'use strict';

var mongoose = require('mongoose');
var express = require('express');
var moment = require('moment');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Hero = require('../models/Hero');
var HeroStat = require('../models/HeroStat');
var Calculator = require('./calculator');
var StatCalculator = require('./statcalculator');

function _dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

function _objectIdFromDate(date) {
	return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

function _getHeroes() {
	return new Promise(async function(resolve, reject) {
		try {
			var heroesObj = await Hero.find({ });
			var heroes = { };
			for (var i = 0; i < heroesObj.length; i++) {
				heroes[heroesObj[i].id] = heroesObj[i].name;
			}
			resolve(heroes);
		} catch (err) {
			reject(err);
		}
	});
}

function _getPlayerSlotInGame(usernames, game) {
	for (var i = 0; i < game.slots.length; i++) {
		for (var j = 0; j < usernames.length; j++) {
			if (game.slots[i].username != null && game.slots[i].username.match(usernames[j])) {
				return i;
			}
		}
	}
	return -1;
}

router.get('/players/:username', async function(req, res) {
	var timePeriod = req.query.timePeriod || 6;
	var period = moment().subtract(timePeriod, 'month').toDate();
	var heroes = await _getHeroes();
	var heroId = null;
	if (req.query.hero) {
		for (var id in heroes) {
			if (heroes[id].toLowerCase() == req.query.hero.toLowerCase()) {
				heroId = id;
				break;
			}
		}
	}
	var allStat = StatCalculator.getPositionsInTheRanking(
		await StatCalculator.getRakingOfPlayers(),
		await StatCalculator.getPlayerStats(req.params.username)
	); 
	var query = { 'slots.username': { $in: allStat.usernames }, 'recorded': true, 'eventname': null, 'createdAt': { $gt: period } };
	if (heroId) {
		query['slots'] = { '$elemMatch': { username: { $in: allStat.usernames }, hero: heroId } };
	} else {
		query['slots.username'] = { $in: allStat.usernames };
	}
	var games = await Game.find(query).sort('-_id');
	var newGamesRanked = [];
	var newGamesNotRanked = [];
	for (var i = 0; i < games.length; i++) {
		var slot = _getPlayerSlotInGame(allStat.usernames, games[i]);
		if (slot != -1 && games[i].slots[slot].hero != 0 && games[i].slots[slot].kills != null) {
			var game = {
				id: games[i].id,
				kills: games[i].slots[slot].kills,
				deaths: games[i].slots[slot].deaths,
				assists: games[i].slots[slot].assists,
				points: games[i].slots[slot].points,
				hero: heroes[games[i].slots[slot].hero],
				date: moment(_dateFromObjectId(games[i]._id.toString())).fromNow(),
				win: games[i].slots[slot].win,
				ranked: games[i].ranked
			};
			if (games[i].ranked) {
				newGamesRanked.push(game);
			} else {
				newGamesNotRanked.push(game);
			}
		}
	}
	var lastGamesRanked = newGamesRanked.slice(0, 5);
	var lastGamesNotRanked = newGamesNotRanked.slice(0, 5);
	var ranking = await StatCalculator.getPlayerHistoryHeroesRanking(req.params.username.toLowerCase(), allStat.usernames, heroes);
	var bestHeroes = ranking.bestHeroes;
	var worstHeroes = ranking.worstHeroes;
	var allHeroes = ranking.allHeroes;
	newGamesRanked.sort(function(a, b) {
		return b.points - a.points;
	});
	newGamesNotRanked.sort(function(a, b) {
		return b.points - a.points;
	});
	var bestGameRanked = newGamesRanked.length > 0 ? newGamesRanked[0] : null;
	var worstGameRanked = newGamesRanked.length > 0 ? newGamesRanked[newGamesRanked.length - 1] : null;
	var bestGameNotRanked = newGamesNotRanked.length > 0 ? newGamesNotRanked[0] : null;
	var worstGameNotRanked = newGamesNotRanked.length > 0 ? newGamesNotRanked[newGamesNotRanked.length - 1] : null;
	if (heroId) {
		for (var i = 0; i < allHeroes.length; i++) {
			if (allHeroes[i]._id == heroId) {
				return res.json({ 
					'stat': allStat, 
					'ranked': {
						'bestGame': bestGameRanked, 
						'worstGame': worstGameRanked, 
						'numGames': newGamesRanked.length, 
						'lastGames': lastGamesRanked
					},
					'notRanked': {
						'bestGame': bestGameNotRanked, 
						'worstGame': worstGameNotRanked, 
						'numGames': newGamesNotRanked.length, 
						'lastGames': lastGamesNotRanked
					},
					'hero': allHeroes[i], 
					'heroRanking': i, 
					'numHeroes': allHeroes.length
				});
			}
		}
	} else {
		allHeroes.sort(function(a, b) {
			return b.games - a.games;
		});
		return res.json({ 
			'stat': allStat, 
			'ranked': {
				'bestGame': bestGameRanked, 
				'worstGame': worstGameRanked, 
				'numGames': newGamesRanked.length, 
				'lastGames': lastGamesRanked
			},
			'notRanked': {
				'bestGame': bestGameNotRanked, 
				'worstGame': worstGameNotRanked, 
				'numGames': newGamesNotRanked.length, 
				'lastGames': lastGamesNotRanked
			},
			'bestHeroes': bestHeroes, 
			'worstHeroes': worstHeroes, 
			'numHeroes': allHeroes.length, 
			'mostPlayed': allHeroes.slice(0, 5)
		});
	}
});

router.delete('/players/:username', async function(req, res) {
	var username = new RegExp(['^', StatCalculator.escapeRegExp(req.params.username.toLowerCase()), '$'].join(''), 'i'); 
	await Stat.remove({ username: username });
	return res.status(200).send();
});

router.post('/players/:username/merge/:another_username', async function(req, res) {
	var username = new RegExp(['^', StatCalculator.escapeRegExp(req.params.username.toLowerCase()), '$'].join(''), 'i'); 
	var sourceAlias = await Stat.findOne({ username: username });
	if (!sourceAlias) return res.status(400).json({ error: 'Old alias not found.' });
	var anotherUsername = new RegExp(['^', StatCalculator.escapeRegExp(req.params.another_username.toLowerCase()), '$'].join(''), 'i'); 
	var destAlias = await Stat.findOne({ username: anotherUsername });
	if (!destAlias) return res.status(400).json({ error: 'New alias not found.' });
	destAlias.games += sourceAlias.games;
	destAlias.gamesRanked += sourceAlias.gamesRanked;
	destAlias.wins += sourceAlias.wins;
	var wa = destAlias.gamesRanked / (destAlias.gamesRanked + sourceAlias.gamesRanked);
	var wb = sourceAlias.gamesRanked / (destAlias.gamesRanked + sourceAlias.gamesRanked);
	destAlias.gpm = destAlias.gpm * wa + sourceAlias.gpm * wb;
	destAlias.assists = destAlias.assists * wa + sourceAlias.assists * wb;
	destAlias.deaths = destAlias.deaths * wa + sourceAlias.deaths * wb;
	destAlias.kills = destAlias.kills * wa + sourceAlias.kills * wb;
	await destAlias.save();
	await sourceAlias.remove();
	return res.status(200).send();
});

router.get('/heroes/:map/:hero_id', async function(req, res) {
	var stat = await HeroStat.findOne({ hero: req.params.hero_id, map: req.params.map });
	if (!stat) return res.status(400).json({ error: 'Hero not found.' });
	stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
	stat.score = Calculator.calculateScore(stat);
	return res.json(stat);
});

router.use('/ranking', function(req, res, next) {
	var attribute = req.query.sort || 'score';
	if (attribute != 'kills' && attribute != 'deaths' && attribute != 'assists' && attribute != 'gpm' && attribute != 'wins' && attribute != 'games' && attribute != 'points' && attribute != 'chance') {
		attribute = 'score'; 
	}   
	var sortOrder = req.query.order || 'asc';
	if (sortOrder != 'asc' && sortOrder != 'desc') {
		sortOrder = 'asc';  
	}  
	req.attribute = attribute;
	req.sortOrder = sortOrder;
	next();
});

router.get('/ranking', async function(req, res) {  
	var minNumGames = 10;
	if (req.query.sort == 'games') {
		minNumGames = -1;
	}
	var stats = await StatCalculator.getRakingOfPlayers(minNumGames);
	stats.sort(function(a, b) { 
		if (req.sortOrder == 'desc') {
			return b.ranking[req.attribute] - a.ranking[req.attribute];
		} else {
			return a.ranking[req.attribute] - b.ranking[req.attribute];
		}
	});  
	return res.json({ 'ranking': stats.slice(0, 10), 'index': 0, 'minIndex': 0 });
});
 
router.get('/ranking/:username', async function(req, res) { 
	var stats = await StatCalculator.getRakingOfPlayers();
	var allStat = StatCalculator.getPositionsInTheRanking(stats, await StatCalculator.getPlayerStats(req.params.username)); 
	stats.sort(function(a, b) {
		if (req.sortOrder == 'desc') {
			return b.ranking[req.attribute] - a.ranking[req.attribute]; 
		} else {
			return a.ranking[req.attribute] - b.ranking[req.attribute]; 
		}
	}); 
	var ranking = 0;
	for (var i = 0; i < stats.length; i++) {
		++ranking;
		if (req.sortOrder != 'desc') {
			if (stats[i].ranking[req.attribute] >= allStat.ranking[req.attribute]) {
				break;
			} 
		} else {  
			if (stats[i].ranking[req.attribute] <= allStat.ranking[req.attribute]) {
				break;
			}
		} 
	} 
	var minIndex = Math.max(0, ranking - 5); 
	var newRanking = stats.splice(minIndex, 10); 
	return res.json({ 'ranking': newRanking, 'index': ranking, 'minIndex': minIndex });
});

module.exports = router;
