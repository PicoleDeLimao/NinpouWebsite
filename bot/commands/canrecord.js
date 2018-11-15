'use strict';

var getGameInfo = require('./getgameinfo');

module.exports = function(gameId, alias, callback) {
	getGameInfo(gameId, function(err, game) {
		if (err) {
			return callback(err);
		} else {
			var canRecord = false;
			for (var i = 0; i < game.slots.length; i++) {
				for (var j = 0; j < alias.length; j++) {
					if (game.slots[i].username != null && game.slots[i].username.toLowerCase() == alias[j].toLowerCase() || 
						(game.slots[i].alias && game.slots[i].alias.toLowerCase() == alias[j].toLowerCase())) {
						canRecord = true;
						break;
					}
				}
				if (canRecord) break;
			}
			return callback(null, canRecord);
		}
	});
};
