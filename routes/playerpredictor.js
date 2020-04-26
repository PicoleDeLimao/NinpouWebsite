'use strict';

var Game = require('../models/Game');
var StatCalculator = require('./statcalculator');
var jsregression = require('js-regression');

async function getGameStats(players, cachedStats) {
    return new Promise(function(resolve) {
        var slots = [];
        for (var i = 0; i < players.length; i++) {
            slots.push({
                username: players[i],
                realm: 'Unknown'
            });
        }
        for (var i = players.length; i < 9; i++) {
            slots.push({
                username: null,
                realm: 'Unknown'
            });
        }
        (function next(i) {
            if (i == players.length) {
                resolve(slots);
            } else {
                if (players[i] in cachedStats) {
                    slots[i] = cachedStats[players[i]];
                    next(i + 1);
                } else {
                    StatCalculator.getPlayerStats(players[i], function(err, stat) {
                        if (err) stat = null; 
                        if (stat == null) {
                            stat = {
                                username: players[i]
                            }
                        }
                        cachedStats[players[i]] = stat;
                        slots[i] = stat;
                        next(i + 1);
                    }, true);
                }
            }
        })(0);
    });
}

function getPlayerSlotInGame(usernames, slots) {
    for (var i = 0; i < slots.length; i++) {
        for (var j = 0; j < usernames.length; j++) {
            if (slots[i].username != null && slots[i].username.match(usernames[j])) {
                return i;
            }
        }
    }
    return -1;
}

function getSlotTeam(i) {
    if (i >= 0 && i <= 2) {
        return 0;
    } else if (i >= 3 && i <= 5) {
        return 1;
    } else {
        return 2;
    }
}

function isSlotAlly(i, j) {
    return getSlotTeam(i) === getSlotTeam(j);
}

function getPlayerAllyOrEnemySlotInGame(slots, slot, ally, best) {
    var points = best ? -999 : 999;
    var index = -1;
    for (var i = 0; i < slots.length; i++) {
        if ((i === slot) || (ally && !isSlotAlly(slot, i)) || (!ally && isSlotAlly(slot, i))) continue;
        if ((best && slots[i].points > points) || (!best && slots[i].points < points)) {
            points = slots[i].points;
            index = i;
        }
    }
    return index;
}

function getTeamPoints(slots, team) {
    var points = 0;
    for (var i = 0; i < slots.length; i++) {
        if (isSlotAlly(i, team)) {
            if (slots[i].hero != 0) {
                points += slots[i].points;
            }
        }
    }
    return points;
}

function getEnemyTeamPoints(slots, slot, best) {
    var team1 = getTeamPoints(slots, 0);
    var team2 = getTeamPoints(slots, 3);
    var team3 = getTeamPoints(slots, 6);
    if (isSlotAlly(slot, 0)) {
        return best ? Math.max(team2, team3) : Math.min(team2, team3);
    } else if (isSlotAlly(slot, 3)) {
        return best ? Math.max(team1, team3) : Math.min(team1, team3);
    } else {
        return best ? Math.max(team1, team2) : Math.min(team1, team2);
    }
}

function getPlayerFeatures(slots, playerSlot) {
    var strongestAllySlot = getPlayerAllyOrEnemySlotInGame(slots, playerSlot, true, true);
    var weakestAllySlot = getPlayerAllyOrEnemySlotInGame(slots, playerSlot, true, false);
    var strongestEnemySlot = getPlayerAllyOrEnemySlotInGame(slots, playerSlot, false, true);
    var weakestEnemySlot = getPlayerAllyOrEnemySlotInGame(slots, playerSlot, false, false);
    if (strongestAllySlot != -1 && weakestAllySlot != -1 && strongestAllySlot != weakestAllySlot &&
            strongestEnemySlot != 1 && weakestEnemySlot != -1 && strongestEnemySlot != weakestEnemySlot) {
        return [
            slots[playerSlot].kills / 25,
            slots[playerSlot].deaths / 20,
            slots[playerSlot].assists / 15,
            slots[playerSlot].gpm / 25,
            slots[playerSlot].score / 5000,
            //slots[strongestAllySlot].points,
            slots[strongestAllySlot].kills / 25,
            slots[strongestAllySlot].deaths / 20,
            slots[strongestAllySlot].assists / 15,
            slots[strongestAllySlot].gpm / 25,
            slots[strongestAllySlot].score / 1000,
            //slots[weakestAllySlot].points,
            slots[weakestAllySlot].kills / 25,
            slots[weakestAllySlot].deaths / 20,
            slots[weakestAllySlot].assists / 15,
            slots[weakestAllySlot].gpm / 25,
            slots[weakestAllySlot].score / 5000,
            //slots[strongestEnemySlot].points,
            slots[strongestEnemySlot].kills / 25,
            slots[strongestEnemySlot].deaths / 20,
            slots[strongestEnemySlot].assists / 15,
            slots[strongestEnemySlot].gpm / 25,
            slots[strongestEnemySlot].score / 1000,
            //slots[weakestEnemySlot].points,
            slots[weakestEnemySlot].kills / 25,
            slots[weakestEnemySlot].deaths / 20,
            slots[weakestEnemySlot].assists / 15,
            slots[weakestEnemySlot].gpm / 25,
            slots[weakestEnemySlot].score / 5000,
            getEnemyTeamPoints(slots, playerSlot, true) / 3 / 300,
            getEnemyTeamPoints(slots, playerSlot, false) / 3 / 300
        ];
    }
    return [];
}

function getPlayerLinearRegressionData(username, cachedStats, callback) {
    StatCalculator.getPlayerStats(username, function (err, allStat) {
        if (err) return callback(err);
        Game.find({ 'slots.username': { $in: allStat.usernames }, 'ranked': true }).limit(25).sort('-_id').exec(async function (err, games) {
            if (err) return res.status(500).json({ error: err });
            var data = [];
            for (var i = 0; i < games.length; i++) {
                var game = games[i];
                var playerSlot = getPlayerSlotInGame(allStat.usernames, game.slots);
                if (playerSlot == -1 || game.slots[playerSlot].hero == 0 || game.slots[playerSlot].kills == null) {
                    continue;
                }
                var y = game.slots[playerSlot].points;
                var players = [];
                for (var j = 0; j < game.slots.length; j++) {
                    players.push(game.slots[j].username);
                }
                var slots = await getGameStats(players, cachedStats);
                var features = getPlayerFeatures(slots, playerSlot);
                if (features.length > 0) {
                    features.push(y / 300);
                    data.push(features);
                }
            }
            return callback(null, data);
        });
    });
}

function getMean(data) {
    var mean = 0;
    for (var i = 0; i < data.length; i++) {
        mean += data[i];
    }
    mean /= data.length;
    return mean;
}

function getStd(data) {
    var mean = getMean(data);
    var std = 0;
    for (var i = 0; i < data.length; i++) {
        std += Math.pow(data[i] - mean, 2);
    }
    std /= data.length - 1;
    std = Math.sqrt(std);
    return std;
}

async function getPlayerLinearRegression(username, cachedStats) {
    return new Promise(function(resolve, reject) {
        console.log("Getting linear regression for " + username + "...");
        getPlayerLinearRegressionData(username, cachedStats, function (err, data) {
            if (err) return reject(err);
            var regression = new jsregression.LinearRegression({
                alpha: 1e-3,
                iterations: 10000,
                lambda: 0.0
            });
            if (data.length > 5) {
                var outputs = [];
                for (var i = 0; i < data.length; i++) {
                    outputs.push(data[i][data[i].length - 1] * 300);
                }
                regression.fit(data);
                regression.std = getStd(outputs);
                regression.avg = getMean(outputs);
                return resolve(regression);
            } else {
                return resolve(null);
            }
        });
    });
}

module.exports = {
    'getPlayerFeatures': getPlayerFeatures,
    'getPlayerLinearRegressionData': getPlayerLinearRegressionData,
    'getPlayerLinearRegression': getPlayerLinearRegression
};
