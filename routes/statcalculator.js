'use strict';

var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Hero = require('../models/Hero');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');
var Calculator = require('./calculator');
var BalanceCalculator = require('./balancecalculator');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function getRankingPosition(players, player, attribute, ascending) {
	var newPlayers = players.slice();
	newPlayers.sort(function(a, b) {
		if (!ascending) {
			return b[attribute] - a[attribute]; 
		} else {
			return a[attribute] - b[attribute]; 
		} 
	}); 
	var ranking = 0;
	for (var i = 0; i < newPlayers.length; i++) {
		++ranking;
		if (ascending) {
			if (newPlayers[i][attribute] >= player[attribute]) {
				break;
			} 
		} else {
			if (newPlayers[i][attribute] <= player[attribute]) {
				break;
			}
		}
	} 
	return ranking;
};  
 
function getRankingPositions(players, player) {
	player.ranking = { };
	player.ranking.kills = getRankingPosition(players, player, 'kills');
	player.ranking.deaths = getRankingPosition(players, player, 'deaths', true);
	player.ranking.assists = getRankingPosition(players, player, 'assists');
	player.ranking.points = getRankingPosition(players, player, 'points');
	player.ranking.gpm = getRankingPosition(players, player, 'gpm');
	player.ranking.chance = getRankingPosition(players, player, 'chance');
	player.ranking.score = getRankingPosition(players, player, 'score');
	player.ranking.games = getRankingPosition(players, player, 'games');
	player.ranking.wins = getRankingPosition(players, player, 'wins');
	return player; 
}; 

function getPlayerStats(username, callback, autocomplete) {
	var search;
	if (autocomplete) {
		search = { $or: [{ alias: new RegExp(['^', escapeRegExp(username.toLowerCase())].join(''), 'i') }, { username: username.toLowerCase() }] };
	} else {
		search = { $or: [{ alias: username.toLowerCase() }, { username: username.toLowerCase() }] };
	}
	Alias.find(search, function(err, alias) {
		if (err) return callback(err);
		var usernames = []; 
		if (alias.length > 0) {
			usernames = alias[0].alias;
			var aliases = [];
			for (var i = 0; i < usernames.length; i++) {
				aliases.push(new RegExp(['^', escapeRegExp(usernames[i].toLowerCase()), '$'].join(''), 'i'));
			}  
			usernames = aliases; 
		} else {
			usernames = [new RegExp(['^', escapeRegExp(username.toLowerCase()), '$'].join(''), 'i')];
		}
		Stat.find({ username: { $in: usernames } }).sort('_id').exec(function(err, stats) {
			if (err) return callback(err); 
			else if (!stats || stats.length == 0) return callback('This player hasn\'t played yet.');
			var allStat = { 
				_id: alias.length > 0 && alias[0].username || stats[0].username,
				kills: 0,
				deaths: 0,
				assists: 0,
				gpm: 0,
				wins: 0,
				games: 0,
				gamesRanked: 0,
				chance: 0,
				score: 0,
				count: 0
			};
			for (var i = 0; i < stats.length; i++) {
				allStat.games += stats[i].games;
				allStat.wins += stats[i].wins;
				allStat.gamesRanked += stats[i].gamesRanked || 0;
			}
			if (allStat.gamesRanked > 0) {
				for (var i = 0; i < stats.length; i++) {
					var factor = (stats[i].gamesRanked || 0) / allStat.gamesRanked;
					allStat.kills += stats[i].kills * factor;
					allStat.deaths += stats[i].deaths * factor;
					allStat.assists += stats[i].assists * factor;
					allStat.points += stats[i].points * factor;
					allStat.gpm += stats[i].gpm * factor;
				}
			}
			allStat.chance = Calculator.AgrestiCoullLower(allStat.gamesRanked, allStat.wins) * 100; 
			allStat.score = Calculator.calculateScore(allStat);
			//allStat.gpm = allStat.gpm * 100;
			allStat.usernames = usernames; 
			return callback(null, allStat);
		});
	});
};
 
function getHeroStats(name, callback) {
	Hero.findOne({ name: new RegExp(['^', escapeRegExp(name.toLowerCase()), '$'].join(''), 'i') }, function(err, hero) {
		if (err) return callback(err);
		else if (!hero) return callback('Hero not found.');
		HeroStat.findOne({ hero: hero.id }).lean().exec(function(err, stat) {
			if (err) return callback(err);
			stat.hero = hero;
			stat.chance = Calculator.AgrestiCoullLower(stat.games, stat.wins);
			stat.kills /= stat.games;
			stat.deaths /= stat.games;
			stat.assists /= stat.games;
			stat.points /= stat.games;
			stat.gpm = stat.gpm / stat.games * 100; 
			stat.chance *= 100;
			stat.score = Calculator.calculateScore(stat); 
			return callback(null, stat);
		});
	});
};

function getAllPlayersRanking(callback, minNumGames) {
	minNumGames = minNumGames || 10;
	Stat.aggregate([
	{
		$group: {
			_id: '$alias',
			kills: { $sum: { $multiply: [ '$kills', '$gamesRanked' ] } },
			deaths: { $sum: { $multiply: [ '$deaths', '$gamesRanked' ] } },
			assists: { $sum: { $multiply: [ '$assists', '$gamesRanked' ] } },
			points: { $sum: { $multiply: [ '$points', '$gamesRanked' ] } },
			gpm: { $sum: { $multiply: [ '$gpm', '$gamesRanked' ] } },
			wins: { $sum: '$wins' },
			games: { $sum: '$games' },
			gamesRanked: { $sum: '$gamesRanked' }
		}
	}
	]).exec(function(err, stats) {
		if (err) return callback(err); 
		for (var i = 0; i < stats.length; i++) {
			stats[i].kills /= stats[i].gamesRanked;
			stats[i].deaths /= stats[i].gamesRanked;
			stats[i].assists /= stats[i].gamesRanked;
			stats[i].points /= stats[i].gamesRanked;
			stats[i].gpm = stats[i].gpm / stats[i].gamesRanked * 100; 
			stats[i].chance = Calculator.AgrestiCoullLower(stats[i].gamesRanked, stats[i].wins) * 100;
			stats[i].score = Calculator.calculateScore(stats[i]); 
		}
		for (var i = stats.length - 1; i >= 0; i--) {
			if (stats[i]._id == null || stats[i].gamesRanked < minNumGames) {
				stats.splice(i, 1); 
			}   
		} 
		for (var i = 0; i < stats.length; i++) { 
			stats[i] = getRankingPositions(stats, stats[i]);
		}   
		return callback(null, stats); 
	});
};

function getAllHeroesRanking(callback) {
	HeroStat.find({ }).lean().exec(function(err, heroes) {
		if (err) return callback(err);
		(function next(i) {
			if (i == heroes.length) {
				heroes.sort(function(a, b) {
					return b.score - a.score;
				});
				return callback(null, heroes);
			} else {
				heroes[i].chance = Calculator.AgrestiCoullLower(heroes[i].games, heroes[i].wins);
				heroes[i].kills /= heroes[i].games;
				heroes[i].deaths /= heroes[i].games;
				heroes[i].assists /= heroes[i].games;
				heroes[i].points /= heroes[i].games;
				heroes[i].gpm = heroes[i].gpm / heroes[i].games * 100; 
				heroes[i].chance *= 100;
				heroes[i].score = Calculator.calculateScore(heroes[i]); 
				Hero.findOne({ id: heroes[i].hero }, function(err, hero) {
					if (err) return callback(err);
					heroes[i].hero = hero;
					next(i + 1);
				});
			}
		})(0);
		heroes.sort(function(a, b) {
			return b.score - a.score;
		});
	});
};

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
					'recorded': true
				}
			},
			{
				$group: {
					_id: '$slots.hero',
					kills: { $sum: '$slots.kills' },
					deaths: { $sum: '$slots.deaths' },
					assists: { $sum: '$slots.assists' },
					points: { $sum: '$slots.points' },
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
				heroes[i].points /= heroes[i].games;
				heroes[i].gpm = heroes[i].gpm / heroes[i].games * 100; 
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

function calculateBalanceFactor(game, callback) {
	var slots = [];
	for (var index = 0; index < 9; index++) {
		if (game.slots[index] && game.slots[index].username) {
			slots.push(game.slots[index].stat); 
		} else {
			slots.push(null);
		}
	}  
	BalanceCalculator.getOptimalBalance(slots, 'points', true, function(err, bestSlots) {
		if (err) return callback(err);
		BalanceCalculator.getOptimalBalance(slots, 'points', false, function(err, worstSlots) {
			if (err) return callback(err); 
			var bestBalance = BalanceCalculator.getBalanceFactor(BalanceCalculator.swapSlots(slots, bestSlots), 'points');
			var worstBalance = BalanceCalculator.getBalanceFactor(BalanceCalculator.swapSlots(slots, worstSlots), 'points');
			var actualBalance = BalanceCalculator.getBalanceFactor(slots, 'points'); 
			var balanceFactor;
			if (worstBalance == bestBalance) {
				balanceFactor = 1;
			} else {
				balanceFactor = (worstBalance - actualBalance) / (worstBalance - bestBalance);
			}
			return callback(null, balanceFactor || 1);
		});
	}); 
};

module.exports = {
	'escapeRegExp': escapeRegExp,
	'getRankingPosition': getRankingPosition,
	'getRankingPositions': getRankingPositions,
	'getPlayerStats': getPlayerStats,
	'getHeroStats': getHeroStats,
	'getAllPlayersRanking': getAllPlayersRanking,
	'getAllHeroesRanking': getAllHeroesRanking,
	'getPlayerHeroesRanking': getPlayerHeroesRanking,
	'calculateBalanceFactor': calculateBalanceFactor
};
