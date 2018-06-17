'use strict';

var http = require('http');
var canRecord = require('./canrecord');

module.exports = function(ev, gameId) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/' + gameId, method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
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
					ev.channel.send('You can\'t unrecord games older than one day. :( **Oink!**');
				}
			} else {
				ev.channel.send('Game unrecorded! :( **Oink!**');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Error while recording game. :( **Oink!**');
	});
	request.end();
	/*canRecord(gameId, alias, function(err, record) { 
		if (err) { 
			if (err == 404) {
				ev.channel.send('Game doesn\'t exist. :( **Oink!**');
			} else {
				ev.channel.send('Couldn\'t fetch game. :( **Oink!**');
			} 
		} else if (!record) {
			ev.channel.send('You can only unrecord a game you played. :( **Oink!**');
		} else {
			
		} 
	});*/
};
