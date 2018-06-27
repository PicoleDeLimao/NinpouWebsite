'use strict';

var http = require('http');

module.exports = function(ev, gameId) { 
	var body = '{ "username": "' + ev.author.id + '" }';
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/' + gameId + '/unrecordable', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				try { 
					var json = JSON.parse(body);
					ev.channel.send(json.error); 
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t unrecord this game. :( **Oink!**');
				}
			} else {
				ev.channel.send('Game is not recordable now! **Oink!**');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t unrecord this game. :( **Oink!**');
	});
	request.write(body);
	request.end();
};
