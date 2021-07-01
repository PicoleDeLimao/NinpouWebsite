'use strict';

var http = require('http');

module.exports = function(ev, title) {
	var body = '{ "title": "' + title + '" }';
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + ev.author.id + '/title', method: 'PUT', 
		headers: { 'Content-Type': 'application/json', 'Content-Length': body.length } }, function(res) {
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
					ev.channel.send('Couldn\'t set title. :( **Oink!** :pig:');
				}
			} else { 
				ev.channel.send('Title set! **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t set title. :( **Oink!** :pig:');
	});
	request.write(body); 
	request.end();
};
