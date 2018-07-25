'use strict';

var http = require('http');
 
module.exports = function(ev, affiliation) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + ev.author.id + '/affiliation/' + affiliation, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				console.log(body);
				try {
					var data = JSON.parse(body);
					ev.channel.send(data.error);
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t join village. :( **Oink!**');
				}
			} else { 
				ev.channel.send('Welcome! Now you are a member of: **' + affiliation.charAt(0).toUpperCase() + affiliation.substr(1) + '**! **Oink!**');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t join village. :( **Oink!**');
	});
	request.end();
};
