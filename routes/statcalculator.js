'use strict';

var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Hero = require('../models/Hero');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');
var Calculator = require('./calculator');
var moment = require('moment');

function _getPlayerUsernames(username) {
	return new Promise(async function(resolve, reject) {
		try {
			var search = { $or: [{ alias: username.toLowerCase() }, { username: username.toLowerCase() }] };
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
			resolve(usernames);
		} catch (err) {
			reject(err);
		}
	});
}

function _getPlayerAllStats(usernames) {
	return new Promise(async function(resolve, reject) {
		try {
			var stats = await Stat.find({ username: { $in: usernames } }).sort('_id').lean();
			var id  = stats.length > 0 && stats[0].username;
			var allStat = { 
				_id: id,
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
				count: 0,
				lastRankedGame: null,
			};
			if (!stats || stats.length == 0) {
				return reject('Player hasn\'t played yet.');
			}
			for (var i = 0; i < stats.length; i++) {
				allStat.games += stats[i].games;
				allStat.wins += stats[i].wins;
				allStat.gamesRanked += stats[i].gamesRanked || 0;
				if (allStat.lastRankedGame == null || (stats[i].lastRankedGame != null && stats[i].lastRankedGame > allStat.lastRankedGame)) {
					allStat.lastRankedGame = stats[i].lastRankedGame;
				}
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
			allStat.score = Calculator.calculateScoreReadjusted(allStat);
			resolve(allStat);
		} catch (err) {
			reject(err);
		}
	});
}

function _getPlayerMeanAndStdPoints(allStat, usernames, timePeriod) {
	return new Promise(async function(resolve, reject) {
		try {
			var heroes = await Game.aggregate([
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
			]);
			var mean = allStat.points;
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
			if (heroes.length > 1) {
				std = Math.sqrt(std / heroes.length);
			} else {
				std = 0;	
			}
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
			resolve({ 'mean': mean, 'std': std });
		} catch (err) {
			console.error(err);
			resolve({ 'mean': allStat.points, 'std': 0 });
		}
	});
}

function _getRankingPosition(players, player, attribute, ascending) {
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
 
function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
  
function getPositionsInTheRanking(players, player) {
	player.ranking = { };
	player.ranking.kills = _getRankingPosition(players, player, 'kills');
	player.ranking.deaths = _getRankingPosition(players, player, 'deaths', true);
	player.ranking.assists = _getRankingPosition(players, player, 'assists');
	player.ranking.points = _getRankingPosition(players, player, 'points');
	player.ranking.gpm = _getRankingPosition(players, player, 'gpm');
	player.ranking.chance = _getRankingPosition(players, player, 'chance');
	player.ranking.score = _getRankingPosition(players, player, 'score');
	player.ranking.games = _getRankingPosition(players, player, 'games');
	player.ranking.wins = _getRankingPosition(players, player, 'wins');
	return player; 
}; 

function getPlayerStats(username, timePeriod) {
	timePeriod = timePeriod || 3;
	timePeriod = moment().subtract(timePeriod, 'month').toDate();
	return new Promise(async function(resolve, reject) {
		try {
			var usernames = await _getPlayerUsernames(username);
			var allStat = await _getPlayerAllStats(usernames);
			allStat.usernames = usernames; 
			allStat.stats = await _getPlayerMeanAndStdPoints(allStat, usernames, timePeriod);
			allStat.score = Calculator.calculateScoreReadjusted(allStat); 
			resolve(allStat);
		} catch (err) {
			reject(err);
		}
	});
};
 
function getHeroStats(name) {
	return new Promise(async function(resolve, reject) {
		try {
			var timePeriod = moment().subtract(3, 'month').toDate();
			var hero = await Hero.findOne({ name: new RegExp(['^', escapeRegExp(name.toLowerCase()), '$'].join(''), 'i') });
			if (!hero) return reject('Hero not found.');
			var heroes = await Game.aggregate([
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
			]);
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
			resolve(stat);
		} catch (err) {
			reject(err);
		}
	});
};

function getRakingOfPlayers(minNumGames) {
	minNumGames = minNumGames || 10;
	return new Promise(async function(resolve, reject) {
		try {
			var stats = await Stat.aggregate([
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
						gamesRanked: { $sum: '$gamesRanked' },
						lastRankedGame: { $max: '$lastRankedGame' },
					}
				}
			]);
			for (var i = 0; i < stats.length; i++) {
				stats[i].kills /= stats[i].gamesRanked;
				stats[i].deaths /= stats[i].gamesRanked;
				stats[i].assists /= stats[i].gamesRanked;
				stats[i].points /= stats[i].gamesRanked;
				stats[i].gpm = stats[i].gpm / stats[i].gamesRanked * 100; 
				stats[i].chance = Calculator.AgrestiCoullLower(stats[i].gamesRanked, stats[i].wins) * 100;
				stats[i].score = Calculator.calculateScoreReadjusted(stats[i]); 
			}
			for (var i = stats.length - 1; i >= 0; i--) {
				if (stats[i]._id == null || stats[i].gamesRanked < minNumGames || stats[i].games < 10) {
					stats.splice(i, 1); 
				}   
			} 
			for (var i = 0; i < stats.length; i++) { 
				stats[i] = getPositionsInTheRanking(stats, stats[i]);
			}
			resolve(stats);
		} catch (err) {
			reject(err);
		}
	});
};

function getRankingOfHeroes(timePeriod, playerId) {
	timePeriod = timePeriod || 3;
	timePeriod = moment().subtract(timePeriod, 'month').toDate();
	return new Promise(async function(resolve, reject) {
		try {
			var match = {
				'createdAt': { $gt: timePeriod },
				'recorded': true,
				'ranked': true
			};
			if (playerId) {
				var usernames = await _getPlayerUsernames(playerId.toLowerCase());
				match['slots.username'] = { $in: usernames };
			}
			var heroes = await Game.aggregate([
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
			]);
			for (var i = 0; i < heroes.length; i++) {
				heroes[i].chance = Calculator.AgrestiCoullLower(heroes[i].games, heroes[i].wins);
				heroes[i].kills /= heroes[i].games;
				heroes[i].deaths /= heroes[i].games;
				heroes[i].assists /= heroes[i].games;
				heroes[i].points /= heroes[i].games;
				heroes[i].gpm = heroes[i].gpm / heroes[i].games * 100; 
				heroes[i].chance *= 100;
				heroes[i].score = Calculator.calculateScore(heroes[i]); 
				var hero = await Hero.findOne({ id: heroes[i]._id });
				heroes[i].hero = hero;
			}
			for (var i = heroes.length - 1; i >= 0; i--) {
				if (heroes[i].hero == null || heroes[i].games <= 0) {
					heroes.splice(i, 1);
				}
			}
			heroes.sort(function(a, b) {
				return b.points - a.points;
			});
			resolve(heroes);	
		} catch (err) {
			reject(err);
		}
	});
};

function getPlayerHistoryHeroesRanking(username, usernames, heroNames, timePeriod) {
	timePeriod = timePeriod || 6;
	timePeriod = moment().subtract(timePeriod, 'month').toDate();
	return new Promise(async function(resolve, reject) {
		try {
			var user = await Alias.findOne({ $or: [{username: username }, { alias: username }] });
			var heroes = await Game.aggregate([
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
			]);
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
			resolve({ 'bestHeroes': bestHeroes, 'worstHeroes': worstHeroes, 'allHeroes': newHeroes });
		} catch (err) {
			reject(err);
		}
	});
}

module.exports = {
	'escapeRegExp': escapeRegExp,
	'getPositionsInTheRanking': getPositionsInTheRanking,
	'getPlayerStats': getPlayerStats,
	'getHeroStats': getHeroStats,
	'getRakingOfPlayers': getRakingOfPlayers,
	'getRankingOfHeroes': getRankingOfHeroes,
	'getPlayerHistoryHeroesRanking': getPlayerHistoryHeroesRanking
};
