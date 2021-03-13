'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, eventName) { 
	console.log(eventName);
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/events/' + eventName }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			if (statusCode != 200) {
				console.error(body);
				ev.channel.send('Couldn\'t fetch event. :( **Oink!** :pig:');
				return;
			} 
			try {
				var data = JSON.parse(body);
				console.log(data);
				var maxPlayerName = 0;
				(function next(i, data) {
					if (i == data.games.length) {
						var response = '```pf\n';
						(function next(i, data, response) {  
							if (i == data.games.length) {  
								response += '```\n';
								return ev.channel.send(response); 
							} else {
								getPlayerName(ev, data.games[i]._id, function(err, playerName) { 
									if (err) {
										console.error(err);
										return ev.channel.send('Couldn\'t fetch event. :( **Oink!** :pig:');
									} 
									var space = ''; 
									for (var x = 0; x < maxPlayerName - playerName.length; x++) {
										space += ' ';
									}  
									response += (i + 1) + '. < ' + playerName + ' >' + space + ' with <' + Math.round(data.games[i].wins) + '> wins; KDA <' + data.games[i].kills + '/' + data.games[i].points + '/' + data.games[i].assists+ '>; Points <' + data.games[i].points + '>\n';
									return next(i + 1, data, response);
								});
							}
						})(0, data, response); 
					} else { 
						getPlayerName(ev, data.games[i]._id, function(err, playerName) {
							if (err) {
								console.error(err);
								return ev.channel.send('Couldn\'t fetch event. :( **Oink!** :pig:');
							}
							maxPlayerName = Math.max(maxPlayerName, playerName.length); 
							next(i + 1, data); 
						});
					}
				})(0, data);
			} catch (err) { 
				console.error(err);
				ev.channel.send('Couldn\'t fetch event. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch event. :( **Oink!** :pig:');
	});
};

