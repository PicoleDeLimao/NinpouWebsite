'use strict';

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
			slots[i].points = 0;
		} else {
			slots[i].points = slots[i].stats.mean;
		}
	}
	var team1 = [];
	var team2 = [];
	var team3 = []; 
	for (var i = 0; i < 3; i++) {
		if (slots[i] && slots[i].points !== null && !isNaN(slots[i].points)) {
			team1.push(slots[i].points);
		}
	}
	for (var i = 3; i < 6; i++) {
		if (slots[i] && slots[i].points !== null && !isNaN(slots[i].points)) {
			team2.push(slots[i].points);
		}
	}
	for (var i = 6; i < 9; i++) {
		if (slots[i] && slots[i].points !== null && !isNaN(slots[i].points)) {
			team3.push(slots[i].points);
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

function getOptimalBalance(stats, minimize) {
	return new Promise(function(resolve, reject) {
		try {
			var slots = [];
			for (var i = 0; i < 9; i++) {
				slots[i] = [i, stats[i]];
			}
			var allStates = [];
			_getAllStates([], 0, allStates);
			for (var i = 0; i < allStates.length; i++) {
				allStates[i] = [_getBalanceFactor(_flattenSlots(swapSlots(slots, allStates[i]))), allStates[i]];
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
			resolve(bestState);
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