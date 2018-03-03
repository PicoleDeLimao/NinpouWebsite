'use strict';

var mongoose = require('mongoose');
var express = require('express');
var https = require('https');
var router = express.Router();
var Game = require('../models/Game');

function parseGameInfoData(data) {
	var gamename = data.split('<b>Gamename</b>: ')[1].split('\t<br />')[0];
	var gameSlots = [];
	var slots = data.split('<tr>');
	for (var i = 2; i < slots.length; i++) {
		if (slots[i].indexOf('<td colspan="3" class="slot">') != -1) {
			gameSlots.push({ 'username': null, 'realm': null, 'ping': null });
		} else {
			var username = slots[i].split('<td class="slot">')[1].split('</td>')[0];
			var realm = slots[i].split('<td class="slot">')[2].split('</td>')[0];
			var ping = slots[i].split('<td class="slot">')[3].split('</td>')[0];
			gameSlots.push({ 'username': username, 'realm': realm, 'ping': ping });
		}
	}
	return {
		'gamename': gamename,
		'slots': gameSlots
	};
}

function getGameInfo(id, players, slots, callback) {
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
					var info = parseGameInfoData(data);
					info['map'] = map;
					info['owner'] = owner;
					info['duration'] = duration;
					info['players'] = players;
					var obj = {
						id: map + id, 
						gamename: gamename,
						map: map, 
						owner: owner,
						duration: duration,
						slots: info.slots 
					};
					Game.update({ id: map + id }, obj, { upsert: true }, function(err) {
						if (err) return callback(err);
						return callback(null, info);
					});
				}
			}
			return callback(null, null);
		});
	}).on('error', function(err) {
		callback(err);
	});
}

router.get('/', function(req, res) {
	https.get({ hostname: 'tonton-bot.herokuapp.com', path: '/?ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
	}).on('error', function(err) {
		
	});
	var games = [];
	https.get({ hostname: 'entgaming.net', path: '/forum/games_fast.php' + '?ie=' + (new Date()).getTime(), headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate', 'Expires': '-1', 'Pragma': 'no-cache' } }, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			var gamesData = data.split('\n');
			var count = gamesData.length;
			var countRequests = 0;
			for (var i = 0; i < gamesData.length; i++) {
				if (gamesData[i] && gamesData[i].split('|').length > 4) {
					var id = gamesData[i].split('|')[0];
					var players = gamesData[i].split('|')[2];
					var slots = gamesData[i].split('|')[3];
					countRequests += 1;
					getGameInfo(id, players, slots, function(err, game) {
						if (err) return res.status(500).end();
						--countRequests;
						if (game != null) {
							games.push(game);
						}
						if (countRequests == 0)
						{
							return res.status(200).json(games);
						}
					});
				}
			}
		});
	}).on('error', function(err) {
		return res.status(500).end();
	});
});

router.get('/last', function(req, res) {
	Game.find({ recorded: false }).sort({ _id: -1 }).limit(10).exec(function(err, games) {
		if (err) return res.status(500).json(err);
		return res.json(games);
	});
});

router.get('/:game_id', function(req, res) {
	Game.findById(req.params.game_id, function(err, game) {
		if (err) return res.status(500).json(err);
		return res.json(game);
	});
});

module.exports = router;