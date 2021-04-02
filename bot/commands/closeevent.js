'use strict';

var http = require('http');

module.exports = function(ev, eventName) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/events/' + encodeURIComponent(eventName) + '/close', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
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
					ev.channel.send('Couldn\'t close event. :( **Oink!** :pig:');
				} 
			} else { 
				ev.channel.send('Event closed! **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t close event. :( **Oink!** :pig:');
	});
	request.end();
};
