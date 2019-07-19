'use strict';

var mongoose = require('mongoose');
var express = require('express');
var moment = require('moment');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Hero = require('../models/Hero');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');
var Calculator = require('./calculator');
var StatCalculator = require('./statcalculator');
var Decoder = require('./decoder');
var Code = require('../models/Code');

function getPlayerAlias(alias, callback) {
	Alias.findOne({ alias: alias.toLowerCase() }, function(err, alias) {
		if (err) return callback(err);
		else if (!alias) return callback(null); 
		else return callback(null, alias.username);
	});
};

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

function objectIdFromDate(date) {
	return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

function saveHeroStats(game, callback) {
	(function save(slot) {
		if (slot >= game.slots.length || slot >= 9) return callback(null);
		if (game.slots[slot].state != 'EMPTY' && game.slots[slot].hero != 0) {
			HeroStat.findOne({ hero: game.slots[slot].hero }, function(err, stat) {
				if (err) return callback(err);
				if (!stat) stat = new HeroStat({
					hero: game.slots[slot].hero
				});
				stat.kills += game.slots[slot].kills;
				stat.deaths += game.slots[slot].deaths;
				stat.assists += game.slots[slot].assists;
				stat.gpm += game.slots[slot].gpm;
				if (game.slots[slot].win) stat.wins += 1;
				stat.games += 1;
				stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
				stat.score = Calculator.calculateScore(stat);
				stat.save(function(err) {
					if (err) return res.status(500).json(err);
					save(slot + 1);
				}); 
			});
		} else {
			save(slot + 1);
		}
	})(0);
}

function savePlayerStats(game, callback) {
	(function save(slot) {
		if (slot >= game.slots.length || slot >= 9) return callback(null);
		if (game.slots[slot].state != 'EMPTY') {
			Stat.findOne({ username: game.slots[slot].username.toLowerCase() }, function(err, stat) {
				if (err) return callback(err);
				if (game.slots[slot].kills == 0 && game.slots[slot].deaths == 0 && game.slots[slot].assists == 0) {
					save(slot + 1);
				} else {
					if (!stat) stat = new Stat({
						username: game.slots[slot].username.toLowerCase(),
						kills: game.slots[slot].kills,
						deaths: game.slots[slot].deaths,
						assists: game.slots[slot].assists,
						gpm: game.slots[slot].gpm
					});
					var decayFactor = Math.min(1 - 1.0 / (stat.games + 1), 0.95);
					var alpha = decayFactor + (1 - decayFactor) * (1 - game.balance_factor);
					var beta = (1 - decayFactor) * game.balance_factor; 
					var oldPoints = stat.kills * 10 + stat.assists * 2 - stat.deaths * 5;
					stat.kills = stat.kills * alpha + game.slots[slot].kills * beta
					stat.deaths = stat.deaths * alpha + game.slots[slot].deaths * beta;
					stat.assists = stat.assists * alpha + game.slots[slot].assists * beta;
					stat.gpm = stat.gpm * alpha + game.slots[slot].gpm * beta;
					if (game.slots[slot].win) stat.wins += 1;
					stat.games += 1; 
					stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
					stat.score = Calculator.calculateScore(stat);
					stat.save(function(err) {
						if (err) return callback(err);
						save(slot + 1);
					});
				}
			});
		} else {
			save(slot + 1);
		}
	})(0);
}

function getPlayerPoints(game, callback) {
	var points = { };
	(function get(slot) {
		if (slot >= game.slots.length || slot >= 9) return callback(null, points);
		if (game.slots[slot].state != 'EMPTY') {
			getPlayerAlias(game.slots[slot].username.toLowerCase(), function(err, alias) {
				var username = err || !alias ? game.slots[slot].username.toLowerCase() : alias;
				StatCalculator.getPlayerStats(username, function(err, stat) {
					if (!err) {
						points[stat._id] = stat.points;
					}
					get(slot + 1);
				});
			});
		} else {
			get(slot + 1);
		}
	})(0);
}

router.post('/', function(req, res) {  
	var game = new Game({
		id: mongoose.Types.ObjectId().toString(),
		createdAt: new Date(),
		gamename: 'Naruto Ninpou Storm',
		map: 'NarutoNS9.5.w3x',
		owner: 'None',
		duration: '00:00:00',
		slots: [],
		players: 0,
		progress: false,
		recorded: true,
		balance_factor: 1.0,
		recordable: true
	});
	var body = req.body.contents;
	if (body.length < 11) return res.status(400).json({ error: 'Invalid code.' });
	Code.findOne({ code: body }, function(err, code) {
		if (err) return res.status(500).json({ error: err });
		else if (code) return res.status(400).json({ error: 'This game was already recorded.' });
		Decoder.decodeGame(body, game, function(err, game) {
			if (err) return res.status(400).json({ error: err });
			else if (game.players != 9) return res.status(400).json({ error: 'You can only record games with 9 players.' });
			else if (parseInt(game.duration.split(':')[0]) == 0 && parseInt(game.duration.split(':')[1]) < 40) return res.status(400).json({ error: 'You can only record games past 40 minutes.' });
			else if (parseInt(game.duration.split(':')[0]) > 0) return res.status(400).json({ error: 'You can only record games between 40 and 60 minutes.' });
			StatCalculator.calculateBalanceFactor(game, function(err, balanceFactor) {
				if (err) return res.status(500).json({ error: err });
				game.balance_factor = balanceFactor;
				if (balanceFactor < 0.8) return res.status(400).json({ error: 'Only games with balance factor > 0.8 can be recorded.' });
				var code = new Code({ code: body });
				code.save(function(err) {
					if (err) return res.status(500).json({ error: err });
					game.save(function(err) {
						if (err) return res.status(500).json({ error: err });
						var changes = [];
						saveHeroStats(game, function(err) {
							if (err) return res.status(500).json({ error: err });
							getPlayerPoints(game, function(err, oldPoints) {
								if (err) return res.status(500).json({ error: err });
								savePlayerStats(game, function(err) {
									if (err) return res.status(500).json({ error: err });
									getPlayerPoints(game, function(err, newPoints) {
										if (err) return res.status(500).json({ error: err });
										var changes = [];
										for (var username in oldPoints) {
											changes.push({ alias: username, oldPoints: oldPoints[username], newPoints: newPoints[username] });
										}
										return res.status(200).json({ changes: changes });
									});
								});
							});
						});
					});
				});
			});  
		});
	});
});

function getHeroes(callback) {
	Hero.find({ }, function(err, heroesObj) {
		if (err) return callback(err);
		var heroes = { };
		for (var i = 0; i < heroesObj.length; i++) {
			heroes[heroesObj[i].id] = heroesObj[i].name;
		}
		callback(null, heroes);
	});
}

function getPlayerSlotInGame(usernames, game) {
	for (var i = 0; i < game.slots.length; i++) {
		for (var j = 0; j < usernames.length; j++) {
			if (game.slots[i].username != null && game.slots[i].username.match(usernames[j])) {
				return i;
			}
		}
	}
	return -1;
}

function getPlayerHeroesRanking(username, usernames, heroNames, timePeriod, callback) {
	Alias.findOne({ $or: [{username: username }, { alias: username }] }, function(err, user) {
		if (err) return callback(err);
		Game.aggregate([
			{
				$unwind: '$slots',
			},
			{
				$match: {
					'createdAt': { $gt: timePeriod },
					'slots.username': { $in: usernames },
					'recorded': true,
					'balance_factor': { $gt: 0.8 }
				}
			},
			{
				$group: {
					_id: '$slots.hero',
					kills: { $sum: '$slots.kills' },
					deaths: { $sum: '$slots.deaths' },
					assists: { $sum: '$slots.assists' },
					gpm: { $sum: '$slots.gpm' },
					wins: { $sum: { $cond: ['$slots.win', 1, 0] } },
					games: { $sum: 1 }
				}
			}
		]).exec(function(err, heroes) {
			if (err) return callback(err);
			var newHeroes = [];
			for (var i = 0; i < heroes.length; i++) {
				heroes[i].kills /= heroes[i].games;
				heroes[i].deaths /= heroes[i].games;
				heroes[i].assists /= heroes[i].games;
				heroes[i].gpm = heroes[i].gpm / heroes[i].games * 100; 
				heroes[i].points = heroes[i].kills * 10 + heroes[i].assists * 2 - heroes[i].deaths * 5;
				heroes[i].chance *= 100;
				heroes[i].score = Calculator.calculateScore(heroes[i]); 
				heroes[i].hero = heroNames[heroes[i]._id];
				if (heroes[i]._id != 0 && heroes[i].points != 0 && heroes[i].hero && heroes[i].games >= 3) {
					newHeroes.push(heroes[i]);
				}
			}
			newHeroes.sort(function(a, b) {
				return b.points - a.points;
			});
			var bestHeroes = newHeroes.slice(0, 5);
			newHeroes.sort(function(a, b) {
				return a.points - b.points;
			});
			var worstHeroes = newHeroes.slice(0, 5);
			newHeroes.sort(function(a, b) {
				return b.points - a.points;
			});
			return callback(null, bestHeroes, worstHeroes, newHeroes);
		});
	});
}

router.get('/players/:username', function(req, res) {
	var timePeriod = moment().subtract(6, 'month').toDate();
	getHeroes(function(err, heroes) {
		if (err) return res.status(400).json({ error: err });
		var heroId = null;
		if (req.query.hero) {
			for (var id in heroes) {
				if (heroes[id].toLowerCase() == req.query.hero.toLowerCase()) {
					heroId = id;
					break;
				}
			}
		}
		StatCalculator.getPlayerStats(req.params.username, function(err, allStat) {
			if (err) return res.status(400).json({ error: err });
			StatCalculator.getAllPlayersRanking(function(err, stats) {
				if (err) return res.status(400).json({ error: err }); 
				allStat = StatCalculator.getRankingPositions(stats, allStat); 
				var query = { 'slots.username': { $in: allStat.usernames }, 'recorded': true, 'balance_factor': { $gt: 0.8 }, 'createdAt': { $gt: timePeriod } };
				if (heroId) {
					query['slots'] = { '$elemMatch': { username: { $in: allStat.usernames }, hero: heroId } };
				} else {
					query['slots.username'] = { $in: allStat.usernames };
				}
				Game.find(query).sort('-_id').exec(function(err, games) {
					if (err) return res.status(500).json({ error: err }); 
					var newGames = [];
					for (var i = 0; i < games.length; i++) {
						var slot = getPlayerSlotInGame(allStat.usernames, games[i]);
						if (games[i].slots[slot].hero != 0 && games[i].slots[slot].kills != null) {
							newGames.push({
								id: games[i].id,
								kills: games[i].slots[slot].kills,
								deaths: games[i].slots[slot].deaths,
								assists: games[i].slots[slot].assists,
								points: games[i].slots[slot].kills * 10 + games[i].slots[slot].assists * 2 - games[i].slots[slot].deaths * 5,
								hero: heroes[games[i].slots[slot].hero],
								date: moment(dateFromObjectId(games[i]._id.toString())).fromNow(),
								win: games[i].slots[slot].win
							});
						}
					}
					var lastGames = newGames.slice(0, 10);
					getPlayerHeroesRanking(req.params.username.toLowerCase(), allStat.usernames, heroes, timePeriod, function(err, bestHeroes, worstHeroes, allHeroes) {
						if (err) return res.status(500).json({ error: err }); 
						newGames.sort(function(a, b) {
							return b.points - a.points;
						});
						var bestGame = newGames.length > 0 ? newGames[0] : null;
						var worstGame = newGames.length > 0 ? newGames[newGames.length - 1] : null;
						if (heroId) {
							for (var i = 0; i < allHeroes.length; i++) {
								if (allHeroes[i]._id == heroId) {
									return res.json({ 'stat': allStat, 'lastGames': lastGames, 'hero': allHeroes[i], 'heroRanking': i, 'numGames': games.length, 'numHeroes': allHeroes.length, 'bestGame': bestGame, 'worstGame': worstGame });
								}
							}
						} else {
							allHeroes.sort(function(a, b) {
								return b.games - a.games;
							});
							return res.json({ 'stat': allStat, 'lastGames': lastGames, 'bestHeroes': bestHeroes, 'worstHeroes': worstHeroes, 'bestGame': bestGame, 'worstGame': worstGame, 'numGames': games.length, 'numHeroes': allHeroes.length, 'mostPlayed': allHeroes.slice(0, 5) });
						}
					});
				});
			});
		});
	});
});

router.delete('/players/:username', function(req, res) {
	var username = new RegExp(['^', StatCalculator.escapeRegExp(req.params.username.toLowerCase()), '$'].join(''), 'i'); 
	Stat.remove({ username: username }, function(err) {
		if (err) return res.status(500).json({ error: err });
		return res.status(200).send();
	});
});

router.post('/players/:username/merge/:another_username', function(req, res) {
	var username = new RegExp(['^', StatCalculator.escapeRegExp(req.params.username.toLowerCase()), '$'].join(''), 'i'); 
	Stat.findOne({ username: username }, function(err, sourceAlias) {
		if (err) return res.status(500).json({ error: err });
		else if (!sourceAlias) return res.status(400).json({ error: 'Old alias not found.' });
		var anotherUsername = new RegExp(['^', StatCalculator.escapeRegExp(req.params.another_username.toLowerCase()), '$'].join(''), 'i'); 
		Stat.findOne({ username: anotherUsername }, function(err, destAlias) {
			if (err) return res.status(500).json({ error: err });
			else if (!destAlias) return res.status(400).json({ error: 'New alias not found.' });
			destAlias.games += sourceAlias.games;
			destAlias.wins += sourceAlias.wins;
			var wa = destAlias.games / (destAlias.games + sourceAlias.games);
			var wb = sourceAlias.games / (destAlias.games + sourceAlias.games);
			destAlias.gpm = destAlias.gpm * wa + sourceAlias.gpm * wb;
			destAlias.assists = destAlias.assists * wa + sourceAlias.assists * wb;
			destAlias.deaths = destAlias.deaths * wa + sourceAlias.deaths * wb;
			destAlias.kills = destAlias.kills * wa + sourceAlias.kills * wb;
			destAlias.save(function(err) {
				if (err) return res.status(500).json({ error: err });
				sourceAlias.remove(function(err) {
					if (err) return res.status(500).json({ error: err });
					return res.status(200).send();
				});
			}); 
		});
	});
});

router.get('/heroes/:map/:hero_id', function(req, res) {
	HeroStat.findOne({ hero: req.params.hero_id, map: req.params.map }, function(err, stat) {
		if (err) return res.status(500).json(err);
		else if (!stat) return res.status(400).json({ error: 'Hero not found.' });
		stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
		stat.score = Calculator.calculateScore(stat);
		return res.json(stat);
	});
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

router.get('/ranking', function(req, res) {  
	StatCalculator.getAllPlayersRanking(function(err, stats) {
		if (err) return res.status(400).json({ error: err });
		stats.sort(function(a, b) { 
			if (req.sortOrder == 'desc') {
				return b.ranking[req.attribute] - a.ranking[req.attribute];
			} else {
				return a.ranking[req.attribute] - b.ranking[req.attribute];
			}
		});  
		return res.json({ 'ranking': stats.slice(0, 10), 'index': 0, 'minIndex': 0 });
	}, req.query.village);  
});
 
router.get('/ranking/:username', function(req, res) { 
	StatCalculator.getPlayerStats(req.params.username, function(err, allStat) {
		if (err) return res.status(400).json({ error: err });
		StatCalculator.getAllPlayersRanking(function(err, stats) {
			if (err) return res.status(400).json({ error: err });
			allStat = StatCalculator.getRankingPositions(stats, allStat); 
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
		}, req.query.village); 
	}); 
});

module.exports = router;
