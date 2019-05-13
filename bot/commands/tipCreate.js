'use strict';

var http = require('http');
var printGold = require('./printgold');

module.exports = function(ev, heroName, tip) {
	var body = '{ "sender": "' + ev.author.id + '", "tip": "' + tip.replace('"', '\"') + '" }';
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/heroes/' + heroName + '/tip', method: 'POST', 
		headers: { 'Content-Type': 'application/json', 'Content-Length': body.length } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			try {
				var data = JSON.parse(body);
				if (!data.gold) { 
					ev.channel.send(data.error);
				} else { 
					ev.channel.send('Tip created! You won: **' + printGold(data.gold) + 'g**. **Oink!** :pig:');
				}
			} catch (err) {
				console.error(err);
				ev.channel.send('Couldn\'t create tip. :( **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t create tip. :( **Oink!** :pig:');
	});
	request.write(body); 
	request.end();
};
