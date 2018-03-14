'use strict';

var mongoose = require('mongoose');
var express = require('express');
var https = require('https');
var router = express.Router();
var Game = require('../models/Game');
var Stat = require('../models/Stat');
var Alias = require('../models/Alias');

var cookie = '';

function getCookie() {
	var request = https.request({ host: 'entgaming.net', path: '/forum/ucp.php?mode=login', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': 0 } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			var sid = body.split('<p><a href="./ucp.php?mode=register&amp;sid=')[1].split('"')[0];
			var dataToSend = 'username=NinpouStorm&password=N1nP0uR0cKs!!!&autologin=on&sid=' + sid + '&login=Login';
			var request = https.request({ host: 'entgaming.net', path: '/forum/ucp.php?mode=login', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(dataToSend) } }, function(res) {
				res.on('data', function(chunk) {
					
				});
				res.on('end', function() {
					var cookies = res.headers['set-cookie'];
					cookie = '';
					for (var i = 0; i < cookies.length; i++) {
						cookie += cookies[i].split(';')[0];
						if (i != cookies.length - 1)
							cookie += '; ';
					}
					console.log('Cookie: ' + cookie);
				});
			});
			request.on('error', function(err) {
				console.log(err);
			});
			request.write(dataToSend);
			request.end();
		});
	});
	request.on('error', function(err) {
		console.log(err); 
	});
	request.end();
};

getCookie();

setInterval(function() {
	getCookie();
}, 60*60*1000);

 
function getPlayerAlias(alias, callback) {
	Alias.findOne({ alias: alias.toLowerCase() }, function(err, alias) {
		if (err) return callback(err);
		else if (!alias) return callback(null, null);
		return callback(null, alias.username);
	});
};  

function parseGameSlots(data, callback) {
	var gamename = data.split('<b>Gamename</b>: ')[1].split('\t<br />')[0];
	var gameSlots = [];
	var slots = data.split('<tr>');
	var players = 0;
	var count = slots.length - 2;
	for (var i = 2; i < slots.length; i++) {
		if (slots[i].indexOf('<td colspan="3" class="slot">') != -1) {
			gameSlots[i - 2] = { 'username': null, 'realm': null, 'ping': null };
			--count;
			if (count <= 0) return callback(null, {
				'gamename': gamename,
				'slots': gameSlots,
				'players': players 
			});
		} else {
			var username = slots[i].split('<td class="slot">')[1].split('</td>')[0];
			var realm = slots[i].split('<td class="slot">')[2].split('</td>')[0];
			var ping = slots[i].split('<td class="slot">')[3].split('</td>')[0];
			if (username) {
				++players;
				(function(index, username, realm, ping) {
					Stat.findOne({ username: username.toLowerCase() }, function(err, stat) {
						if (err) return callback(err);  
						getPlayerAlias(username.toLowerCase(), function(err, alias) {
							if (err) return callback(err);
							if (stat) {
								gameSlots[index - 2] = { 'username': username, 'alias': alias, 'realm': realm, 'ping': ping, 'score': stat.score };
							} else {
								gameSlots[index - 2] = { 'username': username, 'alias': alias, 'realm': realm, 'ping': ping, 'score': 0 };
							}
							--count;
							if (count <= 0) return callback(null, {
								'gamename': gamename,
								'slots': gameSlots,
								'players': players 
							});
						});
					});
				})(i, username, realm, ping);
			} else {
				gameSlots[i - 2] = { 'username': username, 'realm': realm, 'ping': ping, 'score': 0 };
				--count;
				console.log(count); 
				if (count <= 0) return callback(null, {
					'gamename': gamename,
					'slots': gameSlots,
					'players': players 
				});
			}
			
		}
	}
}

function getGameDuration(id, callback) {
	https.get({ hostname: 'entgaming.net', path: '/forum/slots_fast.php?id=' + id + '&ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			if (data.split('<b>Duration</b>: ').length > 1) {
				var duration = data.split('<b>Duration</b>: ')[1].split('\t')[0];
				return callback(null, duration);
			}
			return callback(true);
		});
	}).on('error', function(err) {
		callback(err);
	});
}

function getGameInfo(id, progress, callback) {
	https.get({ hostname: 'entgaming.net', path: '/forum/slots_fast.php?id=' + id + '&ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			if (data.split('<b>Map</b>: ').length > 1) {
				var map = data.split('<b>Map</b>: ')[1].split('</h2>')[0];
				var owner = data.split('<b>Owner</b>: ').length > 1 ? data.split('<b>Owner</b>: ')[1].split('\t')[0] : '';
				var duration = data.split('<b>Duration</b>: ')[1].split('\t')[0];
				var gamename = data.split('<b>Gamename</b>: ')[1].split('\t')[0];
				if (gamename.toLowerCase().indexOf('ninpou') != -1 || map.toLowerCase().indexOf('ninpou') != -1 || map.toLowerCase().indexOf('nns') != -1) {
					parseGameSlots(data, function(err, info) {
						if (err) return callback(err);
						info['id'] = id;
						info['map'] = map;
						info['owner'] = owner;
						info['duration'] = duration;
						info['progress'] = progress; 
						var obj = {
							id: id,
							gamename: gamename,
							map: map, 
							owner: owner,
							duration: duration,
							slots: info.slots,
							players: info.players,
							progress: progress
						}; 
						Game.update({ id: id }, obj, { upsert: true }, function(err) {
							if (err) return callback(err);
							Game.findOne({ id: id }, function(err, game) {
								if (err) return callback(err);
								info['_id'] = game._id;
								return callback(null, info);
							});
						});
					});
				} else {
					return callback(null, null); 
				}
			} else {
				return callback(null, null);
			} 
		});
	}).on('error', function(err) {
		callback(err);
	});
}

var hostedGames = [];
var inProgressGames = [];

setInterval(function() {
	var games = [];
	https.get({ hostname: 'entgaming.net', path: '/forum/games_fast.php' + '?ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			var gamesData = data.split('\n');
			var count = gamesData.length;
			for (var i = 0; i < gamesData.length; i++) {
				if (gamesData[i] && gamesData[i].split('|').length > 4) {
					var id = gamesData[i].split('|')[0];
					var progress = gamesData[i].split('|')[4] == '0';
					var gamename = gamesData[i].split('|')[5];
					if (gamename.toLowerCase().indexOf('[ent]') == -1) {  
						getGameInfo(id, progress, function(err, game) {
							if (game != null) { 
								games.push(game);
							} 
							--count;
							if (count <= 0) hostedGames = games;
						});
					} else { 
						--count;
						if (count <= 0) hostedGames = games;
					}
				} else {
					--count; 
					if (count <= 0) hostedGames = games;
				}
			}
		});
	}).on('error', function(err) {
		console.log('Error: ' + err);
	});
}, 10000);

setInterval(function() {
	var games = [];
	https.get({ hostname: 'entgaming.net', path: '/forum/games_all_fast.php' + '?ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			var gamesData = data.split('\n');
			var count = gamesData.length;
			for (var i = 0; i < gamesData.length; i++) {
				if (gamesData[i] && gamesData[i].split('|').length > 4) {
					var id = gamesData[i].split('|')[0];
					var progress = gamesData[i].split('|')[4] == '0';
					var gamename = gamesData[i].split('|')[5];
					if (gamename.indexOf('[ENT]') == -1 && progress) {
						(function(id, progress) {
							Game.findOne({ id: id }, function(err, game) {
								if (!err && game) {
									getGameInfo(id, progress, function(err, game) {
										if (err) { 
											--count;
											if (count <= 0) inProgressGames = games;
										} else {
											games.push(game);
											--count;
											if (count <= 0) inProgressGames = games;
										}
									});
								} else {
									--count;
									if (count <= 0) inProgressGames = games;
								}
							});
						})(id, progress);
					} else {
						--count;
						if (count <= 0) inProgressGames = games;
					}
				} else {
					--count;
					if (count <= 0) inProgressGames = games;
				}
			}
		});
	}).on('error', function(err) {
		console.log(err);
	});
}, 10000);

setInterval(function() {
	https.get({ hostname: 'tonton-bot.herokuapp.com', path: '/?ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
	}).on('error', function(err) {
		console.log('Error: ' + err);
	});
}, 10000);

router.get('/', function(req, res) { 
	return res.json(hostedGames);
});
 
router.post('/', function(req, response) {
	var dataToSend = 'owner=' + req.body.owner + '&map=:fqna5&location=' + req.body.realm;
	var request = https.request({ host: 'entgaming.net', path: '/link/host.php', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(dataToSend), 'cookie': cookie } }, function(res) {
		var body = '';
		res.on('data', function(chunk) { 
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				return response.status(500).json({ 'error': 'Couldn\'t create game.' }); 
			} else {
				var gamename = body.split('GAMENAME:');
				if (gamename.length > 1) {
					var name = gamename[1].split('</b>')[0];
					return response.status(201).json({ 'gamename': name });
				} else {
					return response.status(400).json({ 'error': 'Game is already created.' }); 
				}
			}
		});
	}); 
	request.on('error', function(err) {
		return response.status(500).json({ 'error': err }); 
	});
	request.write(dataToSend);
	request.end(); 
});

router.get('/progress', function(req, res) {
	return res.json(inProgressGames);
});

router.get('/last', function(req, res) {
	Game.find({ $or: [{ recorded: false }, {recorded: { $exists: false } }], players: 9, progress: true }).sort({ _id: -1 }).limit(10).exec(function(err, games) {
		if (err) return res.status(500).json({ 'error': err });
		return res.json(games);
	});
});
  
router.get('/recorded', function(req, res) {
	Game.find({ recorded: true }).sort({ _id: -1 }).limit(10).exec(function(err, games) {
		if (err) return res.status(500).json({ 'error': err });
		return res.json(games);
	});
});
 
router.get('/:game_id', function(req, res) {
	Game.findOne({ id: req.params.game_id }, function(err, game) {
		if (err) return res.status(500).json({ 'error': err });
		else if (!game) return res.status(404).json({ 'error': 'Game not found.' });
		return res.json(game);
	});
});

module.exports = router;
