'use strict';

var gameToString = require('./gametostring');

function getSwaps(slots) {
	var swaps = [];
	for (var i = 0; i < 9; i++) {
		if (slots[i][0] > i) {
			swaps.push([i, slots[i][0]]);
		}
	}
	return swaps;
};

function calculateDifference(slots) {
	var differences = 0;
	for (var i = 0; i < 9; i++) {
		if (slots[i][0] != i) {
			++differences;
		}
	}
	return differences;
};

function calculateBalance(slots) {
	var team1 = 0;
	for (var i = 0; i < 3; i++) {
		team1 += slots[i][1];
	}
	var team2 = 0;
	for (var i = 3; i < 6; i++) {
		team2 += slots[i][1];
	}
	var team3 = 0;
	for (var i = 6; i < 9; i++) {
		team3 += slots[i][1];
	}
	return Math.pow(team1 - team2, 2) + Math.pow(team2 - team3, 2) + Math.pow(team1 - team3, 2);
};

function getAllSlotStates(slots, index, allStates) {
	if (index == 9) { 
		allStates.push(slots);
	} else {
		getAllSlotStates(slots, index + 1, allStates);
		for (var i = index + 1; i < 9; i++) {
			var newState = slots.slice();
			var tmp = newState[index];
			newState[index] = newState[i];
			newState[i] = tmp;
			getAllSlotStates(newState, index + 1, allStates);
		}
	}
};

function getOptimalBalance(game, criteria, callback) {
	if (!game || (typeof game !== 'object') || game.players < 9) return callback(true);
	var slots = [];
	var countNonEmptySlots = 0;
	for (var i = 0; i < 9; i++) {
		if (game.slots[i].username) {
			slots[countNonEmptySlots] = [i, game.slots[i].stat && game.slots[i].stat[criteria] || 0];
			++countNonEmptySlots;
		}
	}
	if (countNonEmptySlots != 9) return callback(true);
	var allStates = [];
	getAllSlotStates(slots, 0, allStates);
	for (var i = 0; i < allStates.length; i++) {
		allStates[i] = [calculateBalance(allStates[i]), allStates[i]];
	}
	allStates.sort(function(a, b) {
		return a[0] - b[0];
	});
	var bestStates = [allStates[0]];
	for (var i = 1; i < allStates.length; i++) {
		if (allStates[i][0] == allStates[i - 1][0]) {
			bestStates.push(allStates[i]);
		} else {
			break;
		}
	}
	for (var i = 0; i < bestStates.length; i++) {
		bestStates[i][0] = calculateDifference(bestStates[i][1]);
	}
	bestStates.sort(function(a, b) {
		return a[0] - b[0];
	});
	var bestBestStates = [bestStates[0]];
	for (var i = 1; i < bestStates.length; i++) {
		if (bestStates[i][0] == bestStates[i - 1][0]) {
			bestBestStates.push(bestStates[i]);
		}
	}
	var bestState = bestStates[0][1];
	if (bestBestStates.length > 1) {
		for (var i = 1; i < bestBestStates.length; i++) {
			if (bestBestStates[i][1][0][0] == 0) {
				bestState = bestBestStates[i][1];
				break;
			}
		}
	}
	var newGame = JSON.parse(JSON.stringify(game));
	for (var i = 0; i < 9; i++) {
		newGame.slots[i] = game.slots[bestState[i][0]];
	}
	var swaps = getSwaps(bestState);
	return callback(false, newGame, swaps);
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
					});
				}
			});
		}
	})(0, response);
};
