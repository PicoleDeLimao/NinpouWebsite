'use strict';

const { set } = require("mongoose");

function _flattenSlots(slots) {
	var newSlots = [];
	for (var i = 0; i < slots.length; i++) {
		newSlots.push(JSON.parse(JSON.stringify(slots[i][1])));
	}
	return newSlots;
};

function _getBalanceFactor(slots) {
	for (var i = 0; i < slots.length; i++) {
		if (slots[i].username == null) {
			slots[i].score = 0;
		} else {
			slots[i].score = slots[i].score;
		}
	}
	var team1 = [];
	var team2 = [];
	var team3 = []; 
	for (var i = 0; i < 3; i++) {
		if (slots[i] && slots[i].score !== null && !isNaN(slots[i].score)) {
			team1.push(slots[i].score);
		}
	}
	for (var i = 3; i < 6; i++) {
		if (slots[i] && slots[i].score !== null && !isNaN(slots[i].score)) {
			team2.push(slots[i].score);
		}
	}
	for (var i = 6; i < 9; i++) {
		if (slots[i] && slots[i].score !== null && !isNaN(slots[i].score)) {
			team3.push(slots[i].score);
		}
	}
	var sum = function(x) {
		var s = 0;
		for (var i = 0; i < x.length; i++) s += x[i];
		return s;
	};
	var a = Math.pow(sum(team1) - sum(team2), 2);
	var b = Math.pow(sum(team2) - sum(team3), 2);
	var c = Math.pow(sum(team1) - sum(team3), 2);
	return a + b + c;
};

function _isEnemyTeam(a, b) {
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

function _getAllStates(state, index, allStates) {
	if (index == 9) { 
		allStates.push(state);
	} else {
		_getAllStates(state, index + 1, allStates);
		for (var i = index + 1; i < 9; i++) {
			if (_isEnemyTeam(index, i)) {
				var newState = state.slice();
				newState.push([index, i]);
				_getAllStates(newState, index + 1, allStates);
			}
		} 
	}
};

function swapSlots(slots, swaps) {
	var newSlots = slots.slice();
	for (var i = 0; i < swaps.length; i++) {
		var tmp = newSlots[swaps[i][0]];
		newSlots[swaps[i][0]] = newSlots[swaps[i][1]];
		newSlots[swaps[i][1]] = tmp;
	}
	return newSlots;
};

function areEquals(a, b) {
	if (a.length != b.length) return false;
	for (var i = 0; i < a.length; i++) if (a[i] != b[i]) return false;
	return true;
}

function areTeamsCorrect(setsA, setsB) {
	for (var i = 0; i < setsA.length; i++) {
		var found = false;
		setsA[i].sort();
		for (var j = 0; j < setsB.length; j++) {
			setsB[j].sort();
			if (areEquals(setsA[i], setsB[j])) found = true;
		}
		if (!found) return false;
	}
	return true;
}

function getOptimalBalance(stats, minimize) {
	return new Promise(function(resolve, reject) {
		try {
			var slots = [];
			for (var i = 0; i < 9; i++) {
				slots[i] = [i, stats[i]];
			}
			var allStates = [];
			_getAllStates([], 0, allStates);
			var newSlots = slots.slice();
			newSlots.sort(function(a, b) {
				return b[1].points - a[1].points
			});
			var rightSets = {
				0: [newSlots[0][0], newSlots[5][0], newSlots[8][0]],
				1: [newSlots[1][0], newSlots[4][0], newSlots[7][0]],
				2: [newSlots[2][0], newSlots[3][0], newSlots[6][0]]
			}
			for (var i = 0; i < allStates.length; i++) {
				var swappedSlots = swapSlots(slots, allStates[i]);
				var sets = {0: [], 1: [], 2: []};
				for (var j = 0; j < swappedSlots.length; j++) {
					var team;
					if (j == 0 || j == 1 || j == 2) team = 0;
					else if (j == 3 || j == 4 || j == 5) team = 1;
					else team = 2;
					sets[team].push(swappedSlots[j][0]);
				}
				if (areTeamsCorrect(Object.values(rightSets), Object.values(sets))) {
					resolve(allStates[i]);
					break;
				}
			} 
		} catch (err) {
			reject(err);
		}
	});
};


function calculateBalanceFactor(gameSlots) {
	return new Promise(async function(resolve, reject) {
		try {
			var slots = [];
			for (var index = 0; index < 9; index++) {
				if (gameSlots[index] && gameSlots[index].username) {
					slots.push(gameSlots[index]); 
				} else {
					slots.push(null);
				}
			}
			var bestSlots = await getOptimalBalance(slots, true);
			var worstSlots = await getOptimalBalance(slots, false);
			var bestBalance = _getBalanceFactor(swapSlots(slots, bestSlots));
			var worstBalance = _getBalanceFactor(swapSlots(slots, worstSlots));
			var actualBalance = _getBalanceFactor(slots); 
			var balanceFactor;
			if (worstBalance == bestBalance) {
				balanceFactor = 1;
			} else {
				balanceFactor = (worstBalance - actualBalance) / (worstBalance - bestBalance);
			}
			resolve(Math.min(1, balanceFactor || 1));
		} catch (err) {
			reject(err);
		}
	});
};

module.exports = {
	'swapSlots': swapSlots,
	'getOptimalBalance': getOptimalBalance, 
	'calculateBalanceFactor': calculateBalanceFactor
};
