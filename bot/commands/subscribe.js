'use strict';

var http = require('http');

module.exports = function(ev, player, amount) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + ev.author.id + '/subscribe', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': 0 } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			try {
				var data = JSON.parse(body);
				if (res.statusCode != 200) {
					ev.channel.send(data.error);
				} else {
					ev.channel.send('Subscribe ' + (data.subscribe ? 'ON' : 'OFF') + '! **Oink!!**');
				}
			} catch (err) {
				console.error(err);
				ev.channel.send('Couldn\'t subscribe. :( **Oink!**');
			} 
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t subscribe. :( **Oink!**');
	});
	request.end();
};
