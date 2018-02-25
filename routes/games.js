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
	https.get('https://entgaming.net/forum/slots_fast.php?id=' + id, function(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});
		response.on('end', function() {
			if (data.split('<b>Map</b>: ').length > 1) {
				var map = data.split('<b>Map</b>: ')[1].split('</h2>')[0];
				var gamename = data.split('<b>Gamename</b>: ')[1].split('\t<br />')[0];
				if (gamename.toLowerCase().indexOf('ninpou') != -1 || map.toLowerCase().indexOf('ninpou') != -1 || map.toLowerCase().indexOf('nns') != -1) {
					var info = parseGameInfoData(data);
					info['map'] = map;
					info['players'] = players;
					var obj = {
						id: map + id, 
						gamename: gamename,
						map: map, 
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
	var games = [];
	https.get('https://entgaming.net/forum/games_fast.php', function(response) {
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

module.exports = router;