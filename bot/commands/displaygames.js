'use strict';

var gameToString = require('./gametostring');

module.exports = function(ev, games, broadcast, hosted) {
	if (!ev.hostedGames) ev.hostedGames = { };
	for (var gamename in ev.hostedGames) {
		var hasGame = false;
		for (var i = 0; i < games.length; i++) {
			if (gamename == games[i].gamename) {
				hasGame = true;
				break;
			}
		}
		if (!hasGame) {
			ev.hostedGames[gamename].delete();
			delete ev.hostedGames[gamename];
		}
	}   
	if (games.length == 0) { 
			if (ev.message != null) {
				if (hosted) {
					ev.message.edit('No game is being currently played. :( **Oink!**');
				} else {
					ev.message.edit('No game is being currently hosted. :( **Oink!**');
				}
			} else {
				if (hosted) {
					ev.channel.send('No game is being currently played. :( **Oink!**').then(function(message) {
						ev.message = message;
					});
				} else {
					ev.channel.send('No game is being currently hosted. :( **Oink!**').then(function(message) {
						ev.message = message;
					});
				}
			}
	} else {
		var response = '';
		(function next(i, response) {
			if (i == games.length) {
				if (ev.message != null) {
					ev.message.edit(response);
				} else {
					ev.channel.send(response).then(function(message) {
						ev.message = message;
					});
				}
			} else {
				gameToString(ev, games[i], function(game) {
					response += game; 
					if (!ev.hostedGames.hasOwnProperty(games[i].gamename) && broadcast && !hosted) {
						(function(game) {
							ev.channel.send('@here ' + game.gamename).then(function(message) {
								ev.hostedGames[game.gamename] = message;
							});
						})(games[i]);
					}
					next(i + 1, response);
				});
			}
		})(0, response);
	}
};
