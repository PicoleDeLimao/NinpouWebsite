'use strict';

var mongoose = require('mongoose');
var express = require('express');
var moment = require('moment');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');
var Calculator = require('./calculator');
var StatCalculator = require('./statcalculator');

var encodedPlayersId = [];
encodedPlayersId[0] = 6;
encodedPlayersId[1] = 10;
encodedPlayersId[2] = 0;
encodedPlayersId[3] = 9;
encodedPlayersId[4] = 5;
encodedPlayersId[5] = 4;
encodedPlayersId[6] = 2; 
encodedPlayersId[7] = 1;
encodedPlayersId[8] = 8;

var encodedInts = [];
encodedInts[5] = "0";
encodedInts[84] = "1";
encodedInts[21] = "2";
encodedInts[78] = "3";
encodedInts[44] = "4";
encodedInts[45] = "5";
encodedInts[76] = "6";
encodedInts[41] = "7";
encodedInts[25] = "8";
encodedInts[67] = "9";
encodedInts[39] = "a";
encodedInts[23] = "b";
encodedInts[85] = "c";
encodedInts[74] = "d";
encodedInts[11] = "e";
encodedInts[30] = "f";
encodedInts[24] = "g";
encodedInts[66] = "h";
encodedInts[42] = "i";
encodedInts[0] = "j";
encodedInts[77] = "k";
encodedInts[59] = "l";
encodedInts[49] = "m";
encodedInts[9] = "n";
encodedInts[79] = "o";
encodedInts[61] = "p";
encodedInts[69] = "q";
encodedInts[83] = "r";
encodedInts[8] = "s";
encodedInts[27] = "t";
encodedInts[16] = "u";
encodedInts[75] = "v";
encodedInts[70] = "w";
encodedInts[18] = "x";
encodedInts[62] = "y";
encodedInts[65] = "z";
encodedInts[7] = "A";
encodedInts[82] = "B";
encodedInts[19] = "C";
encodedInts[52] = "D";
encodedInts[38] = "E";
encodedInts[56] = "F";
encodedInts[6] = "G";
encodedInts[28] = "H";
encodedInts[58] = "I";
encodedInts[57] = "J";
encodedInts[17] = "K";
encodedInts[29] = "L";
encodedInts[68] = "M";
encodedInts[34] = "N";
encodedInts[54] = "O";
encodedInts[26] = "P";
encodedInts[81] = "Q";
encodedInts[2] = "R";
encodedInts[12] = "S";
encodedInts[50] = "T";
encodedInts[89] = "U";
encodedInts[71] = "V";
encodedInts[15] = "W";
encodedInts[47] = "X";
encodedInts[22] = "Y";
encodedInts[35] = "Z";
encodedInts[20] = ">";
encodedInts[32] = "|";
encodedInts[10] = ";";
encodedInts[87] = "/";
encodedInts[46] = "[";
encodedInts[64] = "]";
encodedInts[1] = "+";
encodedInts[53] = "'";
encodedInts[43] = "-";
encodedInts[60] = "*";
encodedInts[13] = "/";
encodedInts[37] = "<";
encodedInts[3] = ",";
encodedInts[80] = ":";
encodedInts[72] = "?";
encodedInts[33] = "{";
encodedInts[63] = "}";
encodedInts[55] = "!";
encodedInts[36] = "\"";
encodedInts[14] = "@";
encodedInts[40] = "#";
encodedInts[86] = "$";
encodedInts[51] = "%";
encodedInts[73] = "(";
encodedInts[31] = ")";
encodedInts[4] = ".";
encodedInts[88] = "=";
encodedInts[48] = "\\";

function decodeInt(res, string) {
	for (var i = 0; i < 90; i++) {
		if (encodedInts[i] == string) {
			return i;
		}
	}
	res.headerSent = true;
	return res.status(400).json({ error: 'Invalid code.' });
};

function decodePlayerId(res, id) {
	if (id < 0 || id > 8) {
		res.headerSent = true;
		return res.status(400).json({ error: 'Invalid code.' });
	}
	return encodedPlayersId[id];
};

function getSlotId(playerId) {
	if (playerId < 3) return playerId;
	else if (playerId > 3 && playerId < 7) return playerId - 1;
	else return playerId - 2;
};

function getPlayerAlias(alias, callback) {
	Alias.findOne({ alias: alias.toLowerCase() }, function(err, alias) {
		if (err) return callback(err);
		else if (!alias) return callback(null); 
		else return callback(null, alias.username);
	});
};

router.get('/reset_score', function(req, res) {
	Stat.find({ }, function(err, stats) {
		if (err) return;
		(function next(i) {
			if (i == stats.length) return;
			stats[i].kills /= stats[i].games;
			stats[i].deaths /= stats[i].deaths;
			stats[i].assists /= stats[i].assists;
			stats[i].gpm /= stats[i].gpm; 
			stats[i].save(function(err) {
				if (err) return;
				next(i + 1);   
			});
		})(0);
	});
	res.send();
}); 

router.post('/:game_id', function(req, res) {  
	Game.findOne({ id: req.params.game_id }, function(err, game) {
		if (err || !game) return res.status(404).json({ error: 'Game not found.' });
		else if (game.recorded) return res.status(400).json({ error: 'Game was already recorded.' });
		else if (!game.recordable) return res.status(400).json({ error: 'Game is not recordable.' });
		else if (game.slots.length < 9 || !game.progress) return res.status(400).json({ error: 'Invalid game.' });
		var durationHours = parseInt(game.duration.split(':')[0]);
		var durationMinutes = parseInt(game.duration.split(':')[1]);
		if (durationHours == 0 && durationMinutes < 30) return res.status(400).json({ error: 'You can only record games past 30 minutes.' });
		var body = req.body.contents;
		if (body.length < 11) return res.status(400).json({ error: 'Invalid code.' });
		var count = decodeInt(res, body[0]);
		if (res.headerSent) return;
		var winningTeam = decodeInt(res, body[1]);
		if (res.headerSent) return;
		var playerIndex = 0;
		var sum = 0;
		for (var i = 2; i < body.length; i++) {
			var state = body[i];
			var player_id = decodePlayerId(res, playerIndex);
			if (res.headerSent) return;
			var id = getSlotId(player_id);
			if (state == '0') {
				if (game.slots[id].username) {
					return res.status(400).json({ error: 'Invalid code.' });
				}
				game.slots[id].state = 'EMPTY';
			} else if (state == '1' || state == '2') { 
				if (!game.slots[id].username) {
					return res.status(400).json({ error: 'Invalid code.' });
				}
				var letter = body[++i].toLowerCase();
				if (letter != game.slots[id].username[0].toLowerCase()) return res.status(400).json({ error: 'This code doesn\'t belong to this game.' }); 
				var hero = decodeInt(res, body[++i]);
				if (res.headerSent) return;
				var kills = decodeInt(res, body[++i]);
				if (res.headerSent) return;
				var deaths = decodeInt(res, body[++i]); 
				if (res.headerSent) return;
				var assists = decodeInt(res, body[++i]);
				if (res.headerSent) return;
				var gpm = decodeInt(res, body[++i]);
				if (res.headerSent) return;
				game.slots[id].hero = hero;
				game.slots[id].kills = kills;
				game.slots[id].deaths = deaths;
				game.slots[id].assists = assists;
				game.slots[id].gpm = gpm;
				game.slots[id].win = (winningTeam == 3 && (player_id == 0 || player_id == 1 || player_id == 2)) || (winningTeam == 7 && (player_id == 4 || player_id == 5 || player_id == 6)) || (winningTeam == 11 && (player_id == 8 || player_id == 9 || player_id == 10));
				if (state == '1') {
					game.slots[id].state = 'PLAYING';
				} else {
					game.slots[id].state = 'LEFT';
				}
				sum += Math.floor(gpm / 10);
			} else {
				return res.status(400).json({ error: 'Invalid code.' });
			}
			++playerIndex;
			if (playerIndex >= 9) break; 
		}
		if (sum + 1 != count) {
			return res.status(400).json({ error: 'Invalid code.' });
		}
		StatCalculator.calculateBalanceFactor(game, function(err, balanceFactor) {
			if (err) return res.status(500).json(err);
			game.recorded = true;
			game.balance_factor = balanceFactor;
			game.save(function(err) {
				if (err) return res.status(500).json(err);
				(function addStat(index) {
					if (index >= game.slots.length || index >= 9) {
						
					} else if (!game.slots[index].username) {
						addStat(index + 1);
					} else {
						getPlayerAlias(game.slots[index].username.toLowerCase(), function(err, username) {
							if (err) return res.status(500).json(err);
							Stat.findOne({ username: game.slots[index].username.toLowerCase() }, function(err, stat) {
								if (err) return res.status(500).json(err);
								if (!stat) {
									stat = new Stat({
										username: game.slots[index].username.toLowerCase(),
										alias: username || game.slots[index].username.toLowerCase(),
										kills: game.slots[index].kills,
										deaths: game.slots[index].deaths,
										assists: game.slots[index].assists,
										gpm: game.slots[index].gpm
									});
								} 
								var today = new Date();
								var decayFactor = Math.min(1 - 1.0 / (stat.games + 1), 0.95);
								if (today.getDay() == 6 || today.getDay() == 0) {
									var alpha = decayFactor * decayFactor + (1 - decayFactor * decayFactor) * (1 - game.balance_factor);
									var beta = (1 - decayFactor * decayFactor) * game.balance_factor; 
									stat.kills = stat.kills * alpha + game.slots[index].kills * beta;
									stat.deaths = stat.deaths * alpha + game.slots[index].deaths * beta;
									stat.assists = stat.assists * alpha + game.slots[index].assists * beta;
									stat.gpm = stat.gpm * alpha + game.slots[index].gpm * beta;
									if (game.slots[index].win) stat.wins += 2;
									stat.games += 2; 
								} else {  
									var alpha = decayFactor + (1 - decayFactor) * (1 - game.balance_factor);
									var beta = (1 - decayFactor) * game.balance_factor; 
									stat.kills = stat.kills * alpha + game.slots[index].kills * beta
									stat.deaths = stat.deaths * alpha + game.slots[index].deaths * beta;
									stat.assists = stat.assists * alpha + game.slots[index].assists * beta;
									stat.gpm = stat.gpm * alpha + game.slots[index].gpm * beta;
									if (game.slots[index].win) stat.wins += 1;
									stat.games += 1; 
								}
								stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
								stat.score = Calculator.calculateScore(stat);
								stat.alias = username || stat.alias;
								stat.save(function(err) {
									if (err) return res.status(500).json(err);
									HeroStat.findOne({ hero: game.slots[index].hero, map: game.map }, function(err, stat) {
										if (err) return res.status(500).json(err);
										if (!stat) stat = new HeroStat({
											hero: game.slots[index].hero, 
										});
										stat.kills += game.slots[index].kills;
										stat.deaths += game.slots[index].deaths;
										stat.assists += game.slots[index].assists;
										stat.gpm += game.slots[index].gpm;
										if (game.slots[index].win) stat.wins += 1;
										stat.games += 1;
										stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
										stat.score = Calculator.calculateScore(stat);
										stat.save(function(err) {
											if (err) return res.status(500).json(err);
											addStat(index + 1);
										}); 
									});
								});
							});
						});
						
					}
				})(0);
				return res.status(200).end();
			});
		});
	});
});

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

router.delete('/:game_id', function(req, res) { 
	/*Game.findOne({ id: req.params.game_id }, function(err, game) {
		if (err || !game) return res.status(404).json({ error: 'Game not found.' });
		else if (!game.recorded) return res.status(400).json({ error: 'Game was not recorded.' });
		var date = dateFromObjectId(game._id.toString());
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var diffDays = Math.round(Math.abs(((new Date()).getTime() - date.getTime())/(oneDay)));
		if (diffDays > 2) return res.status(400).json({ error: 'You can\'t unrecord games older than one day.' });
		(function resetScore(index) {
			if (index >= game.slots.length) {
				game.recorded = false;
				game.save(function(err) {
					if (err) return res.status(500).json(err);
					return res.status(200).send();
				});
			} else if (game.slots[index].username) {
				Stat.findOne({ username: game.slots[index].username.toLowerCase() }, function(err, stat) {
					if (err) return res.status(500).json(err);
					stat.kills -= game.slots[index].kills;
					stat.deaths -= game.slots[index].deaths;
					stat.assists -= game.slots[index].assists;
					stat.gpm -= game.slots[index].gpm;
					if (game.slots[index].win) stat.wins -= 1;
					stat.games -= 1;
					stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
					stat.score = Calculator.calculateScore(stat);
					stat.save(function(err) {
						if (err) return res.status(500).json(err);
						HeroStat.findOne({ hero: game.slots[index].hero, map: game.map }, function(err, stat) {
							if (err) return res.status(500).json(err);
							stat.kills -= game.slots[index].kills;
							stat.deaths -= game.slots[index].deaths;
							stat.assists -= game.slots[index].assists;
							stat.gpm -= game.slots[index].gpm;
							if (game.slots[index].win) stat.wins -= 1;
							stat.games -= 1;
							stat.chanceWin = Calculator.AgrestiCoullLower(stat.games, stat.wins);
							stat.score = Calculator.calculateScore(stat);
							stat.save(function(err) {
								if (err) return res.status(500).json(err);
								resetScore(index + 1);
							}); 
						});
					});
				});
			} else {
				resetScore(index + 1);
			}
		})(0);
	});*/
});

router.get('/players/:username', function(req, res) {
	StatCalculator.getPlayerStats(req.params.username, function(err, allStat) {
		if (err) return res.status(400).json({ 'error': err });
		Game.find({ 'slots.username': { $in: allStat.usernames } }).sort('-_id').limit(1).exec(function(err, games) {
			if (err) return res.status(500).json({ 'error': err }); 
			var mostRecentDate = games.length > 0 && moment(dateFromObjectId(games[0]._id.toString())).fromNow() || null; 
			StatCalculator.getAllPlayersRanking(function(err, stats) {
				if (err) return res.status(400).json({ 'error': err }); 
				allStat = StatCalculator.getRankingPositions(stats, allStat);       
				Alias.findOne({ $or: [{username: req.params.username.toLowerCase() }, { alias: req.params.username.toLowerCase() }] }, function(err, user) {
					return res.json({ 'stat': allStat, 'lastGame': mostRecentDate, 'user': user });
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
		if (err) return res.status(400).json({ 'error': err });
		stats.sort(function(a, b) { 
			if (req.sortOrder == 'desc') {
				return b.ranking[req.attribute] - a.ranking[req.attribute];
			} else {
				return a.ranking[req.attribute] - b.ranking[req.attribute];
			}
		});  
		return res.json({ 'ranking': stats.slice(0, 10), 'index': 0, 'minIndex': 0 });
	});  
});
 
router.get('/ranking/:username', function(req, res) { 
	StatCalculator.getPlayerStats(req.params.username, function(err, allStat) {
		if (err) return res.status(400).json({ 'error': err });
		StatCalculator.getAllPlayersRanking(function(err, stats) {
			if (err) return res.status(400).json({ 'error': err });
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
		}); 
	}); 
});

module.exports = router;
