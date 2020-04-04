'use strict';

var http = require('http');
 
module.exports = function(ev, character) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + ev.author.id + '/character/' + character, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				try {
					var data = JSON.parse(body);
					ev.channel.send(data.error);
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t buy character. :( **Oink!** :pig:');
				}
			} else { 
				ev.channel.send('Congratulations! You are now: **' + character.charAt(0).toUpperCase() + character.substr(1) + '**! **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t buy character. :( **Oink!** :pig:');
	});
	request.end();
};
