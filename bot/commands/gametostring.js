'use strict';

var getPlayerName = require('./getplayername');
var moment = require('moment');

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

function slotToString(slot, largestName, largestRealm, largetScore, recorded, spectator) {
	var response = '';
	if (!slot.username) {
		var nameSpaces = '';
		for (var j = 0; j < largestName - 5; j++) {
			nameSpaces += ' ';
		}
		response += '[' + nameSpaces + 'Empty]\n';
	} else {
		var nameSpaces = '';
		for (var j = 0; j < largestName - slot.username.length; j++) {
			nameSpaces += ' ';
		}
		var realmSpaces = '';
		for (var j = 0; j < largestRealm - slot.realm.length; j++) {
			realmSpaces += ' ';
		}
		var scoreSpaces = '';
		for (var j = 0; j < largetScore - (Math.round(slot.score) + '').length; j++) {
			scoreSpaces += ' ';
		}
		if (recorded && !spectator) {
			response += '[' + nameSpaces + slot.username + ']' + ' [K: ' + (' '.repeat(2 - (slot.kills + '').length)) + slot.kills + '] [D: ' + (' '.repeat(2 - (slot.deaths + '').length)) + slot.deaths + '] [A: ' + (' '.repeat(2 - (slot.assists + '').length)) + slot.assists + '] [GPM: ' + (' '.repeat(4 - ((slot.gpm * 100) + '').length)) + (slot.gpm * 100) + ']\n'; 
		} else {
			response += '[' + nameSpaces + slot.username + ']' + ' [' + realmSpaces + slot.realm + '] [Score: ' + scoreSpaces + Math.round(slot.score) + ']\n';
		}
	}
	return response;
}

module.exports = function(ev, game, callback) {
	var players = 0;
	var largestName = 5; 
	var largestRealm = 0;
	var largestScore = 0;
	(function next(i, players, largestName, largestRealm, largestScore) {
		if (i == game.slots.length) {
			getPlayerName(ev, game.owner, function(err, ownerName) {
				var response = '```ini\n';
				response += 'Gamename; ' + game.gamename + '\n';
				response += '     Map; ' + game.map + '\n';
				response += '   Owner; ' + ownerName + '\n';
				response += 'Duration; ' + game.duration + '\n';
				if (game.progress) {
					var date = dateFromObjectId(game._id);
					var m = moment(date);
					response += '  Hosted; ' + m.fromNow() + '\n';
				}
				response += '\nSlots; [' + players + '/' + game.slots.length + ']\n';
				if (game.slots.length >= 9) {
					if (game.recorded) {
						var points = 0;
						var win = false;
						for (var i = 0; i < 3; i++) {
							points += game.slots[i].kills * 10 + game.slots[i].assists * 2 - game.slots[i].deaths * 5;
							if (game.slots[i].win) {
								win = true;
							}
						}
						response += 'Konoha;   (' + Math.round(points) + ')\n';
						if (win) {
							response += 'WINNING TEAM\n';
						}
					} else {
						var averageScore = ((game.slots[0].score || 0) + (game.slots[1].score || 0) + (game.slots[2].score || 0)) / 3;
						response += 'Konoha;   (Average score: ' + Math.round(averageScore) + ')\n';
					} 
					for (var i = 0; i < 3; i++) {
						response += slotToString(game.slots[i], largestName, largestRealm, largestScore, game.recorded);
					}
					if (game.recorded) {
						var points = 0;
						var win = false;
						for (var i = 3; i < 6; i++) {
							points += game.slots[i].kills * 10 + game.slots[i].assists * 2 - game.slots[i].deaths * 5;
							if (game.slots[i].win) {
								win = true;
							}
						}
						response += 'Oto;      (' + Math.round(points) + ')\n';
						if (win) {
							response += 'WINNING TEAM\n';
						}
					} else {
						var averageScore = ((game.slots[3].score || 0) + (game.slots[4].score || 0) + (game.slots[5].score || 0)) / 3;
						response += 'Oto;      (Average score: ' + Math.round(averageScore) + ')\n';
					}
					for (var i = 3; i < 6; i++) {
						response += slotToString(game.slots[i], largestName, largestRealm, largestScore, game.recorded);
					}
					if (game.recorded) {
						var points = 0;
						var win = false;
						for (var i = 6; i < 9; i++) {
							points += game.slots[i].kills * 10 + game.slots[i].assists * 2 - game.slots[i].deaths * 5;
							if (game.slots[i].win) {
								win = true;
							}
						}
						response += 'Akatsuki; (' + Math.round(points) + ')\n';
						if (win) {
							response += 'WINNING TEAM\n';
						}
					} else {
						var averageScore = ((game.slots[6].score || 0) + (game.slots[7].score || 0) + (game.slots[8].score || 0)) / 3;
						response += 'Akatsuki; (Average score: ' + Math.round(averageScore) + ')\n';
					}
					for (var i = 6; i < 9; i++) {
						response += slotToString(game.slots[i], largestName, largestRealm, largestScore, game.recorded);
					} 
					if (game.slots.length > 9) {
						response += 'Spectators;\n';
						for (var i = 9; i < game.slots.length; i++) {
							response += slotToString(game.slots[i], largestName, largestRealm, largestScore, game.recorded, true);
						}
					}
				} else {
					for (var i = 0; i < game.slots.length; i++) {
						response += slotToString(game.slots[i], largestName, largestRealm, largestScore);
					}
				}
				response += '```\n'; 
				return callback(response);
			});
		} else {   
			getPlayerName(ev, game.slots[i].alias || game.slots[i].username, function(err, playerName) {
				if (playerName) {
					game.slots[i].username = playerName;
					++players;
					if (game.slots[i].username.length > largestName) {
						largestName = game.slots[i].username.length;
					}
					if (game.slots[i].realm == 'server.eurobattle.net') {
						game.slots[i].realm = 'EuroBattle';
					}
					if (game.slots[i].realm.length > largestRealm) {
						largestRealm = game.slots[i].realm.length;
					}
					if ((Math.round(game.slots[i].score) + '').length > largestScore) {
						largestScore = (Math.round(game.slots[i].score) + '').length;
					}
				}
				return next(i + 1, players, largestName, largestRealm, largestScore);
			});
		}
	})(0, players, largestName, largestRealm, largestScore);
}; 
