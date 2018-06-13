'use strict';

var gameToString = require('./gametostring');

function swapSlots(slots, swaps) {
	var newSlots = slots.slice();
	for (var i = 0; i < swaps.length; i++) {
		var tmp = newSlots[swaps[i][0]];
		newSlots[swaps[i][0]] = newSlots[swaps[i][1]];
		newSlots[swaps[i][1]] = tmp;
	}
	return newSlots;
};

function calculateBalance(slots) {
	var team1 = 0;
	var team2 = 0;
	var team3 = 0; 
	for (var i = 0; i < 3; i++) {
		if (slots[i][1] !== null) {
			team1 += slots[i][1];
		}
	}
	for (var i = 3; i < 6; i++) {
		if (slots[i][1] !== null) {
			team2 += slots[i][1];
		}
	}
	for (var i = 6; i < 9; i++) {
		if (slots[i][1] !== null) {
			team3 += slots[i][1];
		}
	}
	team1 /= 3;
	team2 /= 3;
	team3 /= 3;
	return Math.pow(team1 - team2, 2) + Math.pow(team2 - team3, 2) + Math.pow(team1 - team3, 2);
};

function isEnemyTeam(a, b) {
	var teamA;
	if (a < 3) teamA = 0;
	else if (a < 6) teamA = 1;
	else teamA = 2;
	var teamB;
	if (b < 3) teamB = 0;
	else if (b < 6) teamB = 1;
	else teamB = 2;
	return teamA != teamB;
}

function getAllStates(state, index, allStates) {
	if (index == 9) { 
		allStates.push(state);
	} else {
		getAllStates(state, index + 1, allStates);
		for (var i = index + 1; i < 9; i++) {
			if (isEnemyTeam(index, i)) {
				var newState = state.slice();
				newState.push([index, i]);
				getAllStates(newState, index + 1, allStates);
			}
		} 
	}
};

function getOptimalBalance(game, criteria, callback) {
	if (!game || (typeof game !== 'object') || game.slots.length < 9) return callback(true);
	var slots = [];
	for (var i = 0; i < 9; i++) {
		slots[i] = [i, game.slots[i].stat && game.slots[i].stat[criteria] || null];
	}
	var allStates = [];
	getAllStates([], 0, allStates);
	for (var i = 0; i < allStates.length; i++) {
		allStates[i] = [calculateBalance(swapSlots(slots, allStates[i])), allStates[i]];
	}
	allStates.sort(function(a, b) {
		return a[0] - b[0];
	});
	var bestStates = [];
	for (var i = 0; i < allStates.length; i++) {
		if (allStates[i][0] == allStates[0][0]) {
			bestStates.push(allStates[i]);
		} else {
			break;
		}
	}
	for (var i = 0; i < bestStates.length; i++) {
		bestStates[i][0] = bestStates[i][1].length;
	}
	bestStates.sort(function(a, b) {
		return a[0] - b[0];
	});
	var bestState = bestStates[0][1];
	for (var i = 0; i < bestStates.length; i++) {
		if (bestStates[i][0] == bestStates[0][0] && swapSlots(slots, bestStates[i][1])[0][0] == 0) {
			bestState = bestStates[i][1];
			break;
		} else if (bestStates[i][0] != bestStates[0][0]) {
			break;
		}
	} 
	var newGame = JSON.parse(JSON.stringify(game));
	var newSlots = swapSlots(slots, bestState);
	for (var i = 0; i < 9; i++) {
		newGame.slots[i] = game.slots[newSlots[i][0]];
	}
	return callback(false, newGame, bestState);
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
