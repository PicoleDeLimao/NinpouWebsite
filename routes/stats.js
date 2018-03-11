'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var HeroStat = require('../models/HeroStat');
var Alias = require('../models/Alias');

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
	return res.status(400).json({ error: 'Invalid code.' });
};

function decodePlayerId(res, id) {
	if (id < 0 || id > 8) {
		return res.status(400).json({ error: 'Invalid code.' });
	}
	return encodedPlayersId[id];
};

function getSlotId(playerId) {
	if (playerId < 3) return playerId;
	else if (playerId > 3 && playerId < 7) return playerId - 1;
	else return playerId - 2;
};

function AgrestiCoullLower(n, k) {
	//float conf = 0.05;  // 95% confidence interval
	var kappa = 100;//2.24140273; // In general, kappa = ierfc(conf/2)*sqrt(2)
	var kest=k+Math.pow(kappa,2)/2;
	var nest=n+Math.pow(kappa,2); 
	var pest=kest/nest;
	var radius=kappa*Math.sqrt(pest*(1-pest)/nest);
	return Math.max(0,pest-radius); // Lower bound
	// Upper bound is min(1,pest+radius)
};

function calculateScore(stat) {
	var score = (stat.kills / stat.games * 10 - stat.deaths / stat.games * 5 + stat.assists / stat.games * 2 * AgrestiCoullLower(stat.games, stat.wins)) / 1068.0 / Math.max(1, 100 - AgrestiCoullLower(stat.games, stat.wins) * 100) * (stat.gpm / stat.games * AgrestiCoullLower(stat.games, stat.wins) * 100) * 1000000;  
	if (isNaN(score)) return 0;
	return score;
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
			getPlayerAlias(stats[i].username, function(err, alias) {
				if (err) return;
				stats[i].alias = alias || stats[i].username;
				stats[i].score = calculateScore(stats[i]);
				stats[i].save(function(err) {
					if (err) return;
					next(i + 1);
				});
			});
		})(0);
	});
	res.send();
}); 

router.post('/:game_id', function(req, res) {
	Game.findOne({ id: req.params.game_id }, function(err, game) {
		if (err || !game) return res.status(400).json({ error: 'Game not found.' });
		else if (game.recorded) return res.status(400).json({ error: 'Game was already recorded.' });
		else if (game.slots.length != 9 || !game.progress) return res.status(400).json({ error: 'Invalid game.' });
		var body = req.body.contents;
		if (body.length < 11) return res.status(400).json({ error: 'Invalid code.' });
		var count = decodeInt(res, body[0]);
		var winningTeam = decodeInt(res, body[1]);
		var playerIndex = 0;
		var sum = 0;
		for (var i = 2; i < body.length; i++) {
			var state = body[i];
			var player_id = decodePlayerId(res, playerIndex);
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
				var hero = decodeInt(res, body[++i]);
				var kills = decodeInt(res, body[++i]);
				var deaths = decodeInt(res, body[++i]);
				var assists = decodeInt(res, body[++i]);
				var gpm = decodeInt(res, body[++i]);
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
		}
		if (sum + 1 != count) {
			return res.status(400).json({ error: 'Invalid code.' });
		}
		game.recorded = true;
		game.save(function(err) {
			if (err) return res.status(500).json(err);
			(function addStat(index) {
				if (index >= game.slots.length) {
					
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
									alias: username || game.slots[index].username.toLowerCase()
								});
							} 
							stat.kills += game.slots[index].kills;
							stat.deaths += game.slots[index].deaths;
							stat.assists += game.slots[index].assists;
							stat.gpm += game.slots[index].gpm;
							if (game.slots[index].win) stat.wins += 1;
							stat.games += 1; 
							stat.score = calculateScore(stat);
							stat.alias = username || stat.alias;
							stat.save(function(err) {
								if (err) return res.status(500).json(err);
								HeroStat.findOne({ hero: game.slots[index].hero, map: game.map }, function(err, stat) {
									if (err) return res.status(500).json(err);
									if (!stat) stat = new HeroStat({
										hero: game.slots[index].hero, 
										map: game.map
									});
									stat.kills += game.slots[index].kills;
									stat.deaths += game.slots[index].deaths;
									stat.assists += game.slots[index].assists;
									stat.gpm += game.slots[index].gpm;
									if (game.slots[index].win) stat.wins += 1;
									stat.games += 1;
									stat.score = AgrestiCoullLower(stat.games, stat.wins);
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

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

router.delete('/:game_id', function(req, res) {
	Game.findOne({ id: req.params.game_id }, function(err, game) {
		if (err || !game) return res.status(400).json({ error: 'Game not found.' });
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
					stat.score = calculateScore(stat);
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
							stat.score = calculateScore(stat);
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
	});
});

router.get('/players/:username', function(req, res) {
	Alias.find({ alias: req.params.username.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json(err);
		var usernames = [];
		if (alias.length > 0) {
			usernames = alias[0].alias;
		} else {
			usernames = [req.params.username.toLowerCase()];
		}
		console.log(usernames);
		Stat.find({ username: { $in: usernames } }, function(err, stats) {
			if (err) return res.status(500).json(err);
			else if (!stats || stats.length == 0) return res.status(400).json({ error: 'Player not found.' });
			var allStat = new Stat({ 
				_id: alias.length > 0 && alias[0].username || stats[0].username 
			});     
			for (var i = 0; i < stats.length; i++) {
				allStat.kills += stats[i].kills;
				allStat.deaths += stats[i].deaths;
				allStat.assists += stats[i].assists;
				allStat.gpm += stats[i].gpm;
				allStat.wins += stats[i].wins;
				allStat.games += stats[i].games;
				allStat.score = calculateScore(allStat);
			}
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
				if (err) return res.status(500).json(err);
				for (var i = 0; i < stats.length; i++) {
					stats[i].score = calculateScore(stats[i]);
				}
				stats.sort(function(a, b) {
					return b.score - a.score; 
				}); 
				var ranking = 0;
				for (var i = 0; i < stats.length; i++) {
					++ranking;
					if (stats[i].score <= allStat.score) {
						break;
					}
				}
				return res.json({ 'stat': allStat, 'ranking': ranking });
			}); 
		});
	});	
});

router.get('/heroes/:map/:hero_id', function(req, res) {
	HeroStat.findOne({ hero: req.params.hero_id, map: req.params.map }, function(err, stat) {
		if (err) return res.status(500).json(err);
		else if (!stat) return res.status(400).json({ error: 'Hero not found.' });
		stat.score = calculateScore(stat);
		return res.json(stat);
	});
});

router.get('/ranking', function(req, res) {
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
		if (err) return res.status(500).json(err);
		for (var i = 0; i < stats.length; i++) {
			stats[i].score = calculateScore(stats[i]);
		} 
		stats.sort(function(a, b) {
			return b.score - a.score;
		});  
		return res.json({ 'ranking': stats.slice(0, 10), 'index': 0, 'minIndex': 0 });
	});
});
 
router.get('/ranking/:username', function(req, res) {
	Alias.find({ alias: req.params.username.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json(err);
		var usernames = [];
		if (alias.length > 0) { 
			usernames = alias[0].alias;
		} else {
			usernames = [req.params.username.toLowerCase()];
		}
		Stat.find({ username: { $in: usernames } }, function(err, stats) {
			if (err) return res.status(500).json(err);
			else if (!stats || stats.length == 0) return res.status(400).json({ error: 'Player not found.' });
			var allStat = new Stat({
				_id: alias.length > 0 && alias[0].username || stats[0].username 
			});  
			for (var i = 0; i < stats.length; i++) {
				allStat.kills += stats[i].kills;
				allStat.deaths += stats[i].deaths;
				allStat.assists += stats[i].assists;
				allStat.gpm += stats[i].gpm;
				allStat.wins += stats[i].wins;
				allStat.games += stats[i].games;
				allStat.score = calculateScore(allStat);
				allStat.alias = stats.length > 1 && alias.alias || stats[0].username;
			}
			Stat.aggregate([
			{
				$match: { username: { $nin: usernames } }
			},
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
				if (err) return res.status(500).json(err);
				for (var i = 0; i < stats.length; i++) {
					stats[i].score = calculateScore(stats[i]);
				}
				stats.sort(function(a, b) {
					return b.score - a.score; 
				});
				var ranking = 0;
				for (var i = 0; i < stats.length; i++) {
					if (stats[i].score <= allStat.score) {
						break;
					}
					++ranking;
				} 
				var minIndex = Math.max(0, ranking - 5);
				var newRanking = stats.slice(minIndex, minIndex + 10);
				newRanking.push(allStat);
				newRanking.sort(function(a, b) {
					return b.score - a.score; 
				}); 
				var index = null; 
				for (var i = 0; i < newRanking.length; i++) {
					if (newRanking[i] == allStat) {
						index = i;
						break;
					}
				}
				return res.json({ 'ranking': newRanking, 'index': index, 'minIndex': minIndex });
			}); 
		});
	});	
});

module.exports = router;