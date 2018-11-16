'use strict';

var http = require('http');

module.exports = function(bot, game) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + game.owner, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() { 
			if (res.statusCode == 200) { 
				try { 
					var data = JSON.parse(body); 
					var alias = data.username;
					if (data.subscribe) {
						bot.guilds.forEach(function(guild) {
							guild.members.forEach(function(member) {
								if (member.id == alias) {
									member.sendMessage('Game ' + game.gamename + ' is full!\n\nType !subscribe to disable these messages.');
								}
							});
						});
					}
				} catch (e) {
					console.error(e);
				}
			}
		});
	});
};
 