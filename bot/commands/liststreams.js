'use strict';

var http = require('http');

module.exports = function(ev) {  
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/streams/', method: 'GET', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
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
					ev.channel.send('Couldn\'t list streams. :( **Oink!**');
				}
			} else {  
				try {
					var data = JSON.parse(body);
					var response = '';
					for (var i = 0; i < data.length; i++) {
						response += '<https://twitch.tv/' + data[i].channel + '>\n';
					}
					ev.channel.send(response);
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t list streams. :( **Oink!**');
				} 
			}
		});
	}); 
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t list streams. :( **Oink!**');
	});
	request.end();
};
