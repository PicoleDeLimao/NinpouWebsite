'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, user) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + user, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() { 
			if (res.statusCode != 200) { 
				ev.channel.send('This user doesn\'t exist. **Oink!**');
			} else {
				try { 
					var data = JSON.parse(body); 
					getPlayerName(ev, user, function(err, name) {
						var response = '```ini\n' + 
						name + '\n' + 
						'Gold : [' + (data.gold || 0) + ']\n' + 
						'Level: [' + (data.level || 1) + ']\n' + 
						'XP:    [' + (data.xp || 0) + '%]```';
						ev.channel.send(response);
					}) 
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t fetch user info. :( **Oink!**');
				}
			}
		});
	})
	.on('error', function(err) {
		console.error(err); 
		ev.channel.send('Couldn\'t fetch alias. :( **Oink!**');
	}); 
};
