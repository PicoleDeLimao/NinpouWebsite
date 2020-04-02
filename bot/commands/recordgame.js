'use strict';

var canRecord = require('./canrecord');
var getPlayerName = require('./getplayername');
var http = require('http');

module.exports = function(ev, code) {
	var dataToSend = '{ "contents": "' + code + '" }';
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataToSend) } }, function(res) {
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
					ev.channel.send('Error while recording game. :( **Oink!** :pig:');
				}
			} else { 
				try {
					var game = JSON.parse(body);
					var today = new Date();
					if (today.getDay() == 6 || today.getDay() == 0) {
						ev.channel.send('Game recorded! Double XP is on today!! **Oink!** :pig:\n\nTip: Type `!rank ' + game.id + '` to make this game a ranked game.');
					} else {
						ev.channel.send('Game recorded! **Oink!** :pig:\n\nTip: Type `!rank ' + game.id + '` to make this game a ranked game.');
					}
				} catch (e) {
					ev.channel.send('Error while recording game. :( **Oink!** :pig:');
				}
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Error while recording game. :( **Oink!** :pig:');
	});
	request.write(dataToSend);
	request.end();
};

 