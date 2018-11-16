'use strict';

var gameToString = require('./gametostring');

module.exports = function(ev, games, broadcast, hosted) {
	if (!ev.hostedGames) ev.hostedGames = { };
	for (var gameid in ev.hostedGames) {
		var hasGame = false;
		for (var i = 0; i < games.length; i++) {
			if (gameid == games[i].id) {
				hasGame = true;
				break;
			}
		}
		if (!hasGame) {
			ev.hostedGames[gameid].delete().then(function() {
				delete ev.hostedGames[gameid];
			});
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
					if (!ev.hostedGames.hasOwnProperty(games[i].id) && broadcast && !hosted) {
						(function(game) {
							ev.channel.send('@here ' + game.id).then(function(message) {
								ev.hostedGames[game.id] = message;
							});
						})(games[i]);
					}
					next(i + 1, response);
				});
			}
		})(0, response);
	}
};
