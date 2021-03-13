'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');
var printGold = require('./printgold');

module.exports = function(ev, user) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/characters', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() { 
			if (res.statusCode != 200) { 
				ev.channel.send('Couldn\'t fetch characters. :( **Oink!** :pig:');
			} else {
				try { 
					var data = JSON.parse(body); 
					var msg = '**Oink, oink** :pig:!\nHere are the available characters to buy\n' + 
					'```pf\nUse !char <character> to buy a character\n';
					var maxLength = 0;
					for (var name in data.characters) {
						maxLength = Math.max(maxLength, name.length + 1);
					}
					var characters = [];
					for (var name in data.characters) {
						characters.push({
							name: name,
							gold: data.characters[name].gold,
							level: data.characters[name].level
						});
					}
					(function next(i) {
						if (i == characters.length) {
							msg += '```';
							ev.channel.send(msg);
						} else {
							if (i % 20 == 0) {
								msg += '```';
								ev.channel.send(msg);
								msg = '```';
							}
							for (var j = 0; j < maxLength - characters[i].name.length; j++) {
								msg += ' ';
							}
							msg += characters[i].name[0].toUpperCase() + characters[i].name.substring(1) + ' ';
							msg += ': ';
							if (characters[i].gold == 0) {
								msg += '-';
							} else {
								msg += 'Requires level ' + characters[i].level + ', ' + printGold(characters[i].gold) + 'g';
							}
							if (data.owners[characters[i].name]) {
								getPlayerName(ev, data.owners[characters[i].name], function(err, name) {
									msg += ' (owned by ' + name + ')';
									msg += '\n';
									next(i + 1);
								}, true);
							} else {
								msg += '\n';
								next(i + 1);
							}
						}
					})(0);
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t fetch characters. :( **Oink!** :pig:');
				}
			}
		});
	})
	.on('error', function(err) {
		console.error(err); 
		ev.channel.send('Couldn\'t fetch characters. :(  **Oink!** :pig:');
	}); 
};


