'use strict';

var gameToString = require('./gametostring');
var getPlayerName = require('./getplayername');
var http = require('http');

module.exports = function(bot, ev, gameId) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/' + gameId }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				try { 
					var json = JSON.parse(body);
					ev.channel.send(json.error);
				} catch (err) {
					console.error(err);
					ev.channel.send('Error while executing this command. :( **Oink!** :pig:');
				}
			} else { 
				var game = JSON.parse(body);
				var message = '<@' + ev.author.id + '> asked to make the game `' + gameId + '` ranked. React with 👍 to approve it.\n\n';
				gameToString(ev, game, async function(gameString) {
					message += gameString;
					var channel = await bot.channels.fetch('692560325584748616');
					channel.send(message);
				});
			}
		});
	});
};
