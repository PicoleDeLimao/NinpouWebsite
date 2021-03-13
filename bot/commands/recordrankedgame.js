'use strict';

var gameToString = require('./gametostring');
var getPlayerName = require('./getplayername');
var http = require('http');

function sendToChannel(bot, ev, gameId, eventName) {
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
				var message;
				if (eventName) {
					message = '**[Event ' + eventName + ']**: <@' + ev.author.id + '> asked to make the game `' + gameId + '` ranked. React with 👍 to approve it or 👎 to reject it.\n\n';
				} else {
					message = '<@' + ev.author.id + '> asked to make the game `' + gameId + '` ranked. React with 👍 to approve it or 👎 to reject it.\n\n';
				}
				gameToString(ev, game, async function(gameString) {
					message += gameString;
					var channel = await bot.channels.fetch('692560325584748616');
					channel.send(message);
					ev.channel.send('Request was sent to channel <#692560325584748616>. Wait for a moderator to approve it. **Oink!** :pig:');
				});
			}
		});
	});
}

module.exports = function(bot, ev, gameId, eventName) {
	if (!eventname) {
		eventName = null;
	}
	module.exports = function(ev, eventName) {
		var requestBody = JSON.stringify({
			event_name: eventName
		});
		var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/' + gameId, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody) } }, function(res) {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function() {
				if (res.statusCode != 201) {
					try {
						var data = JSON.parse(body);
						ev.channel.send(data.error);
					} catch (err) {
						ev.channel.send('Couldn\'t rank game. :( **Oink!** :pig:');
					} 
				} else {
					sendToChannel(bot, ev, gameId, eventName);
				}
			});
		});
		request.on('error', function(err) {
			console.error(err);
			ev.channel.send('Couldn\'t rank game. :( **Oink!** :pig:');
		});
		request.write(requestBody);
		request.end();
	};
};
