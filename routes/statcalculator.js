'use strict';

var Game = require('../models/Game');
var Stat = require('../models/Stat');
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
  
function getPlayerStats(username, callback) {
	Alias.find({ $or: [{ alias: username.toLowerCase() }, { username: username.toLowerCase() }] }, function(err, alias) {
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
			else if (!stats || stats.length == 0) return callback('This player haven\'t played yet.');
			var allStat = { 
				_id: alias.length > 0 && alias[0].username || stats[0].username,
				kills: 0,
				deaths: 0,
				assists: 0,
				gpm: 0,
				wins: 0,
				games: 0,
				chance: 0,
				score: 0
			};     
			for (var i = 0; i < stats.length; i++) {
				allStat.kills += stats[i].kills;
				allStat.deaths += stats[i].deaths;
				allStat.assists += stats[i].assists;
				allStat.gpm += stats[i].gpm;
				allStat.wins += stats[i].wins;
				allStat.games += stats[i].games;
			}  
			allStat.chance = Calculator.AgrestiCoullLower(allStat.games, allStat.wins); 
			allStat.kills /= stats.length;
			allStat.deaths /= stats.length;
			allStat.assists /= stats.length; 
			allStat.gpm = allStat.gpm / stats.length * 100;
			allStat.points = allStat.kills * 10 + allStat.assists * 2 - allStat.deaths * 5; 
			allStat.chance *= 100;
			allStat.score = Calculator.calculateScore(allStat);
			//allStat.gpm = allStat.gpm * 100;
			allStat.usernames = usernames; 
			return callback(null, allStat);
		});
	});
};
 
function getAllPlayersRanking(callback, village) {
	Stat.aggregate([
	{
		$group: {
			_id: '$alias',
			kills: { $sum: '$kills' },
			deaths: { $sum: '$deaths' },
			assists: { $sum: '$assists' },
			gpm: { $sum: '$gpm' },
			wins: { $sum: '$wins' },
			games: { $sum: '$games' },
			count: { $sum: 1 }
		}
	}
	]).exec(function(err, stats) {
		if (err) return callback(err); 
		for (var i = 0; i < stats.length; i++) {
			stats[i].chance = Calculator.AgrestiCoullLower(stats[i].games, stats[i].wins);
			stats[i].kills /= stats[i].count;
			stats[i].deaths /= stats[i].count;
			stats[i].assists /= stats[i].count;
			stats[i].gpm = stats[i].gpm / stats[i].count * 100; 
			stats[i].points = stats[i].kills * 10 + stats[i].assists * 2 - stats[i].deaths * 5;
			stats[i].chance *= 100;
			stats[i].score = Calculator.calculateScore(stats[i]); 
		}    
		for (var i = stats.length - 1; i >= 0; i--) {
			if (stats[i].games < 10) {
				stats.splice(i, 1); 
			}   
		} 
		for (var i = 0; i < stats.length; i++) { 
			stats[i] = getRankingPositions(stats, stats[i]);
		}   
		return callback(null, stats); 
	});
};

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
	'getAllPlayersRanking': getAllPlayersRanking,
	'calculateBalanceFactor': calculateBalanceFactor
};
