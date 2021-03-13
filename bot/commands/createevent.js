'use strict';

var http = require('http');

module.exports = function(ev, eventName) {
	var requestBody = JSON.stringify({
		event_name: eventName
	});
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/events', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody) } }, function(res) {
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
					ev.channel.send('Couldn\'t create event. :( **Oink!** :pig:');
				} 
			} else { 
				ev.channel.send('Event create! **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t create event. :( **Oink!** :pig:');
	});
	request.write(requestBody);
	request.end();
};
