'use strict';

var http = require('http');

module.exports = function(ev, playerId) { 
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/players/' + playerId + '/rerank', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
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
					ev.channel.send('Couldn\'t rerank player. :( **Oink!** :pig:');
				}
			} else {  
				ev.channel.send('Stats recalculated! **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t rerank player. :( **Oink!** :pig:');
	});
	request.end();
};
