'use strict';

var PlayerPredictor = require('./playerpredictor');

function swapSlots(slots, swaps) {
	var newSlots = slots.slice();
	for (var i = 0; i < swaps.length; i++) {
		var tmp = newSlots[swaps[i][0]];
		newSlots[swaps[i][0]] = newSlots[swaps[i][1]];
		newSlots[swaps[i][1]] = tmp;
	}
	return newSlots;
};

function flattenSlots(slots) {
	var newSlots = [];
	for (var i = 0; i < slots.length; i++) {
		newSlots.push(slots[i][1]);
	}
	return newSlots;
};

function getBalanceFactor(slots, regressions) {
	for (var i = 0; i < slots.length; i++) {
		if (slots[i].username == null) {
			slots[i].points = 0;
		} else {
			var averagePoints = slots[i].points;//(slots[i].kills * 10 + slots[i].assists * 2 - slots[i].deaths * 5);
			if (slots[i].gamesRanked > 5 && regressions[slots[i].username] != null) {
				var features = PlayerPredictor.getPlayerFeatures(slots, i);
				if (features.length > 0) {
					var model = regressions[slots[i].username];
					var newFeatures = new Array(1);
					newFeatures[0] = features;
					var predictedPoints = model.predict(newFeatures)[0] * 300;
					predictedPoints = Math.max(predictedPoints, model.avg - model.std);
					predictedPoints = Math.min(predictedPoints, model.avg + model.std);
					slots[i].points = predictedPoints;
				} else {
					slots[i].points = averagePoints;
				}
			} else {
				slots[i].points = averagePoints;
			}
			if (isNaN(slots[i].points)) {
				slots[i].points = averagePoints;
			}
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
	//team1 /= 3;
	//team2 /= 3;
	//team3 /= 3;
	var sum = function(x) {
		var s = 0;
		for (var i = 0; i < x.length; i++) s += x[i];
		return s;
	};
	var max = function(x) {
		var m = x.length > 0 && x[0] || 0;
		for (var i = 0; i < x.length; i++) m = Math.max(m, x[i]);
		return m;
	};
	var a = Math.pow(sum(team1) - sum(team2), 2);
	var b = Math.pow(sum(team2) - sum(team3), 2);
	var c = Math.pow(sum(team1) - sum(team3), 2);
	//var d = Math.pow(max(team1) - max(team2), 2);
	//var e = Math.pow(max(team2) - max(team3), 2);
	//var f = Math.pow(max(team1) - max(team3), 2);
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

function getOptimalBalance(stats, regressions, minimize, callback) {
	var slots = [];
	for (var i = 0; i < 9; i++) {
		slots[i] = [i, stats[i]];
	}
	var allStates = [];
	getAllStates([], 0, allStates);
	for (var i = 0; i < allStates.length; i++) {
		allStates[i] = [getBalanceFactor(flattenSlots(swapSlots(slots, allStates[i])), regressions), allStates[i]];
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

function calculateBalanceFactor(gameSlots, regressions, callback) {
	var slots = [];
	for (var index = 0; index < 9; index++) {
		if (gameSlots[index] && gameSlots[index].username) {
			slots.push(gameSlots[index]); 
		} else {
			slots.push(null);
		}
	}  
	getOptimalBalance(slots, regressions, true, function(err, bestSlots) {
		if (err) return callback(err);
		getOptimalBalance(slots, regressions, false, function(err, worstSlots) {
			if (err) return callback(err); 
			var bestBalance = getBalanceFactor(swapSlots(slots, bestSlots), regressions);
			var worstBalance = getBalanceFactor(swapSlots(slots, worstSlots), regressions);
			var actualBalance = getBalanceFactor(slots, regressions); 
			var balanceFactor;
			if (worstBalance == bestBalance) {
				balanceFactor = 1;
			} else {
				balanceFactor = (worstBalance - actualBalance) / (worstBalance - bestBalance);
			}
			return callback(null, balanceFactor || 1);
		});
	}); 
};

module.exports = {
	'swapSlots': swapSlots,
	'getOptimalBalance': getOptimalBalance, 
	'calculateBalanceFactor': calculateBalanceFactor
};
