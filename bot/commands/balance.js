'use strict';

var gameToString = require('./gametostring');
var http = require('http');

function swapSlots(slots, swaps) {
	var newSlots = slots.slice();
	for (var i = 0; i < swaps.length; i++) {
		var tmp = newSlots[swaps[i][0]];
		newSlots[swaps[i][0]] = newSlots[swaps[i][1]];
		newSlots[swaps[i][1]] = tmp;
	}
	return newSlots;
};

function getOptimalBalance(game, criteria, callback) {
	if (!game || (typeof game !== 'object') || game.slots.length < 9) return callback(true);
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/' + game.id + '/balance?criteria=' + criteria, method: 'GET', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode == 200) {
				var slots = []; 
				for (var i = 0; i < 9; i++) {
					slots[i] = [i, game.slots[i] && game.slots[i][criteria] || null];
				}
				var data = JSON.parse(body); 
				var bestState = data.swaps; 
				game.balance_factor = 1;
				var newGame = JSON.parse(JSON.stringify(game));
				var newSlots = swapSlots(slots, bestState);
				for (var i = 0; i < 9; i++) {
					newGame.slots[i] = game.slots[newSlots[i][0]];
				}
				return callback(false, newGame, bestState);
			} else {  
				return callback(body);
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		return callback('Couldn\'t calculate balance. :( **Oink!**');
	});
	request.end();
};

function getSwapSlot(slot) {
	if (slot < 3) return slot + 1;
	else if (slot < 6) return slot + 2;
	else return slot + 3;
};

module.exports = function(ev, games, criteria) {
	var response = '';
	(function next(i, response) {
		if (i == games.length) {
			if (response == '') {
				ev.channel.send('There are not available games to balance! **Oink**!');
			} else {
				ev.channel.send(response);
			}
		} else { 
			getOptimalBalance(games[i], criteria, function(err, game, swaps) {
				if (err) {
					console.log(err); 
					next(i + 1, response);
				} else {
					gameToString(ev, game, function(gameString) {
						response += '**Optimal balance (balancing by average ' + criteria + '):**\n';
						response += gameString; 
						if (swaps.length == 0) {
							response += '**This game is already on optimal balance!**\n';
						} else { 
							response += '**To balance, type this in-game:**\n';
							for (var j = 0; j < swaps.length; j++) {
								response += '!swap ' + (getSwapSlot(swaps[j][0])) + ' ' + (getSwapSlot(swaps[j][1])) + '\n';
							}
						}
						next(i + 1, response);
					}, criteria);
				}
			});
		}
	})(0, response);
};
