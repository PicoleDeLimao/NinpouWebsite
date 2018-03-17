'use strict';

var getGameInfo = require('./getgameinfo');
var gameToString = require('./gametostring');

module.exports = function(ev, id) {
	getGameInfo(id, function(err, game) {
		if (err) {
			if (err == 404) {
				ev.channel.send('Game doesn\'t exist. :( **Oink!**');
			} else {
				ev.channel.send('Couldn\'t fetch game. :( **Oink!**');
			} 
		} else {
			gameToString(ev, game, function(response) {
				ev.channel.send(response);
			});
		}
	});
};
