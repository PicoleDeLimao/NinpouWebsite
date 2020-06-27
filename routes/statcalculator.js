'use strict';

var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Hero = require('../models/Hero');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');
var Calculator = require('./calculator');
var moment = require('moment');

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
				points: 0,
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
			var timePeriod = moment().subtract(3, 'month').toDate();
			Game.aggregate([
				{
					$unwind: '$slots',
				},
				{
					$match: {
						'createdAt': { $gt: timePeriod },
						'slots.username': { $in: usernames },
						'recorded': true,
						'ranked': true
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
				if (err) return callback(null, allStat, { 'mean': allStat.points, 'std': 0 });
				if (heroes.length >= 1) {
					mean = allStat.points;
					var std = 0;
					var numStrongHeroes = 0;
					var numPlayedHeroes = 0;
					for (var i = 0; i < heroes.length; i++) {
						var points = heroes[i].points / heroes[i].games;
						if (points >= allStat.points) {
							numStrongHeroes++;
						}
						if (heroes[i].games >= 3) {
							numPlayedHeroes++;
						}
						std += Math.pow(mean - points, 2);
					}
					std = Math.sqrt(std / heroes.length);
					if (numStrongHeroes < 5) {
						mean -= 20;
					} else if (numStrongHeroes < 10) {
						mean -= 15;
					} else if (numStrongHeroes < 15) {
						mean -= 10;
					} else  if (numStrongHeroes < 20) {
						mean -= 5;
					}
					if (numPlayedHeroes < 5) {
						mean -= 20;
					} else if (numPlayedHeroes < 10) {
						mean -= 15;
					} else if (numPlayedHeroes < 15) {
						mean -= 10;
					} else  if (numPlayedHeroes < 20) {
						mean -= 5;
					}
				} else {
					var mean = allStat.points;
					var std = 0;
				}
				return callback(null, allStat, { 'mean': mean, 'std': std });
			});
		});
	});
};
 
function getHeroStats(name, callback) {
	var timePeriod = moment().subtract(3, 'month').toDate();
	Hero.findOne({ name: new RegExp(['^', escapeRegExp(name.toLowerCase()), '$'].join(''), 'i') }, function(err, hero) {
		if (err) return callback(err);
		else if (!hero) return callback('Hero not found.');
		Game.aggregate([
			{
				$unwind: '$slots',
			},
			{
				$match: {
					'createdAt': { $gt: timePeriod },
					'slots.hero': hero.id,
					'recorded': true,
					'ranked': true
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
			var stat = { };
			stat.hero = hero;
			stat.kills = 0;
			stat.deaths = 0;
			stat.assists = 0;
			stat.points = 0;
			stat.gpm = 0;
			stat.games = 0;
			stat.wins = 0;
			for (var i = 0; i < heroes.length; i++) {
				stat.kills += heroes[i].kills;
				stat.deaths += heroes[i].deaths;
				stat.assists += heroes[i].assists;
				stat.points += heroes[i].points;
				stat.gpm += heroes[i].gpm;
				stat.games += heroes[i].games; 
				stat.wins += heroes[i].wins;
			}
			stat.chance = Calculator.AgrestiCoullLower(stat.games, stat.wins);
			stat.kills /= stat.games;
			stat.deaths /= stat.games;
			stat.assists /= stat.games;
			stat.points /= stat.games;
			stat.gpm = stat.gpm / stat.games * 100; 
			stat.chance = Calculator.AgrestiCoullLower(stat.games, stat.wins);
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
			if (stats[i]._id == null || stats[i].gamesRanked < minNumGames || stats[i].games < 10) {
				stats.splice(i, 1); 
			}   
		} 
		for (var i = 0; i < stats.length; i++) { 
			stats[i] = getRankingPositions(stats, stats[i]);
		}   
		return callback(null, stats); 
	});
};

async function getAllHeroesRanking(period, callback, playerId) {
	var timePeriod = moment().subtract(period, 'month').toDate();
	var match = {
		'createdAt': { $gt: timePeriod },
		'recorded': true,
		'ranked': true
	};
	if (playerId) {
		var search = { $or: [{ alias: playerId.toLowerCase() }, { username: playerId.toLowerCase() }] };
		try {
			var alias = await Alias.find(search);
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
			match['slots.username'] = { $in: usernames };
		} catch (err) {
			console.error(err);
			return callback(err);
		}
	}
	Game.aggregate([
		{
			$unwind: '$slots',
		},
		{
			$match: match
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
		(function next(i) {
			if (i == heroes.length) {
				for (var i = heroes.length - 1; i >= 0; i--) {
					if (heroes[i].hero == null || heroes[i].games < 3) {
						heroes.splice(i, 1);
					}
				}
				heroes.sort(function(a, b) {
					return b.points - a.points;
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
				Hero.findOne({ id: heroes[i]._id }, function(err, hero) {
					if (err) return callback(err);
					heroes[i].hero = hero;
					next(i + 1);
				});
			}
		})(0);
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

module.exports = {
	'escapeRegExp': escapeRegExp,
	'getRankingPosition': getRankingPosition,
	'getRankingPositions': getRankingPositions,
	'getPlayerStats': getPlayerStats,
	'getHeroStats': getHeroStats,
	'getAllPlayersRanking': getAllPlayersRanking,
	'getAllHeroesRanking': getAllHeroesRanking,
	'getPlayerHeroesRanking': getPlayerHeroesRanking
};
