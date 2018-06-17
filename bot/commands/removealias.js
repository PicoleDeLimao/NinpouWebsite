'use strict';

var http = require('http');

module.exports = function(ev, alias, author) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + (author || ev.author.id) + '/' + alias, method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				ev.channel.send('This alias is not linked to your account. :( **Oink!**');
			} else { 
				ev.channel.send('Alias removed! **Oink!**');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t removed alias. :( **Oink!**');
	});
	request.end();
};
 
