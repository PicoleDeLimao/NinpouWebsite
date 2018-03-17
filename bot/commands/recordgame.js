'use strict';

var canRecord = require('./canrecord');
var http = require('http');

module.exports = function(ev, gameId, code, alias) {
	canRecord(gameId, alias, function(err, record) { 
		if (err) { 
			if (err == 404) {
				ev.channel.send('Game doesn\'t exist. :( **Oink!**');
			} else {
				ev.channel.send('Couldn\'t fetch game. :( **Oink!**');
			} 
		} else if (!record) {
			ev.channel.send('You can only record a game you played with. :( **Oink!**');
		} else {
			var dataToSend = '{ "contents": "' + code.replace(/"/g, '\\"') + '" }';
			var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/' + gameId, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataToSend) } }, function(res) {
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
							ev.channel.send('Error while recording game. :( **Oink!**');
						}
					} else { 
						ev.channel.send('Game recorded! :) **Oink!**');
					}
				});
			});
			request.on('error', function(err) {
				console.error(err);
				ev.channel.send('Error while recording game. :( **Oink!**');
			});
			request.write(dataToSend);
			request.end();
		}
	}); 
};

 