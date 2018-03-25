'use strict';

var http = require('http');

module.exports = function(ev, owner, realm) {
	var dataToSend = '{ "owner": "' + owner + '", "realm": "' + realm + '" }'; 
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataToSend) } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk; 
		});
		res.on('end', function() {
			if (res.statusCode == 201) {
				try {
					var json = JSON.parse(body);
					ev.channel.send('GAMENAME: ' + json.gamename);
				} catch (err) {
					console.error(err);
					ev.channel.send('Error while hosting game. :( **Oink!**');
				}  
			} else if (res.statusCode == 400) { 
				ev.channel.send('A game is already in lobby! Check #games-hosted **Oink!**');
			} else {
				ev.channel.send('Error while hosting game. :( **Oink!**');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t host game. :( **Oink!**');
	});
	request.write(dataToSend);
	request.end(); 
};
