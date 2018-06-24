'use strict';

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
	var a = Math.pow(team1 - team2, 2);
	var b = Math.pow(team2 - team3, 2);
	var c = Math.pow(team1 - team3, 2);
	return a + b + c;
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

function getOptimalBalance(stats, criteria, minimize, callback) {
	var slots = [];
	for (var i = 0; i < 9; i++) {
		slots[i] = [i, stats[i] && stats[i][criteria] || null];
	}
	var allStates = [];
	getAllStates([], 0, allStates);
	for (var i = 0; i < allStates.length; i++) {
		allStates[i] = [calculateBalance(swapSlots(slots, allStates[i])), allStates[i]];
	}
	allStates.sort(function(a, b) {
		return minimize ? a[0] - b[0] : b[0] - a[0];
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
	return callback(null, bestState);
};

function getBalanceFactor(slots, stat) {
	var team1 = 0;
	var team2 = 0;
	var team3 = 0; 
	for (var i = 0; i < 3; i++) {
		if (slots[i] && slots[i][stat] !== null) {
			team1 += slots[i][stat];
		}
	}
	for (var i = 3; i < 6; i++) {
		if (slots[i] && slots[i][stat] !== null) {
			team2 += slots[i][stat];
		}
	}
	for (var i = 6; i < 9; i++) {
		if (slots[i] && slots[i][stat] !== null) {
			team3 += slots[i][stat];
		}
	}
	team1 /= 3;
	team2 /= 3;
	team3 /= 3;
	var a = Math.pow(team1 - team2, 2);
	var b = Math.pow(team2 - team3, 2);
	var c = Math.pow(team1 - team3, 2);
	return a + b + c;
};

module.exports = {
	'swapSlots': swapSlots,
	'getOptimalBalance': getOptimalBalance, 
	'getBalanceFactor': getBalanceFactor 
};