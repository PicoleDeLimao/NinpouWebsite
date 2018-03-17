'use strict';

var http = require('http');

module.exports = function(ev, alias) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + alias, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() { 
			if (res.statusCode != 200) { 
				ev.channel.send('This alias hasn\'t been reclaimed yet! **Oink!**');
			} else {
				try { 
					var json = JSON.parse(body);
					ev.channel.send('<@' + json.username + '>');
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t fetch alias. :( **Oink!**');
				}
			}
		});
	})
	.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch alias. :( **Oink!**');
	}); 
};
