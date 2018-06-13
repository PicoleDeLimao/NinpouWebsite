'use strict';

var Game = require('../models/Game');
var Stat = require('../models/Stat');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');
var Calculator = require('./calculator');

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
			allStat.score = Calculator.calculateScore(allStat);
			allStat.points = (allStat.kills * 10 + allStat.assists * 2 - allStat.deaths * 5) / allStat.games;
			allStat.kills /= allStat.games;
			allStat.deaths /= allStat.games;
			allStat.assists /= allStat.games; 
			allStat.gpm = allStat.gpm / allStat.games * 100;
			allStat.chance *= 100;
			allStat.usernames = usernames; 
			return callback(null, allStat);
		});
	});
};
 
function getAllPlayersRanking(callback) {
	Stat.aggregate([
	{
		$group: {
			_id: '$alias',
			kills: { $sum: '$kills' },
			deaths: { $sum: '$deaths' },
			assists: { $sum: '$assists' },
			gpm: { $sum: '$gpm' },
			wins: { $sum: '$wins' },
			games: { $sum: '$games' }
		}
	}
	], function(err, stats) {
		if (err) return callback(err); 
		for (var i = 0; i < stats.length; i++) {
			stats[i].chance = Calculator.AgrestiCoullLower(stats[i].games, stats[i].wins);
			stats[i].score = Calculator.calculateScore(stats[i]);
			stats[i].points = (stats[i].kills * 10 + stats[i].assists * 2 - stats[i].deaths * 5) / stats[i].games;
			stats[i].kills /= stats[i].games;
			stats[i].deaths /= stats[i].games;
			stats[i].assists /= stats[i].games;
			stats[i].gpm = stats[i].gpm / stats[i].games * 100;
			stats[i].chance *= 100;
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

module.exports = {
	'escapeRegExp': escapeRegExp,
	'getRankingPosition': getRankingPosition,
	'getRankingPositions': getRankingPositions,
	'getPlayerStats': getPlayerStats,
	'getAllPlayersRanking': getAllPlayersRanking
};
