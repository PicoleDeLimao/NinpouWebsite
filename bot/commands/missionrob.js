'use strict';

var http = require('http');
var printGold = require('./printgold');

module.exports = function(ev, user) {
	ev.guild.members.fetch(ev.author.id).then(function(authorMember) { 
		var authorVillage = 'none';
		authorMember._roles.forEach(function(role) {
			if (role.name.toLowerCase() == 'shinobi alliance') {
				authorVillage = 'shinobi alliance';
			} else if (role.name.toLowerCase() == 'otogakure') {
				authorVillage = 'otogakure';
			} else if (role.name.toLowerCase() == 'akatsuki') {
				authorVillage = 'akatsuki';
			}
		});
		ev.guild.members.fetch(user).then(function(robMember) { 
			var robVillage = 'none';
			robMember._roles.forEach(function(role) {
				if (role.name.toLowerCase() == 'shinobi alliance') {
					robVillage = 'shinobi alliance';
				} else if (role.name.toLowerCase() == 'otogakure') {
					robVillage = 'otogakure';
				} else if (role.name.toLowerCase() == 'akatsuki') {
					robVillage = 'akatsuki';
				}
			});
			setTimeout(function() {
				if (authorVillage != robVillage) {
					var dataToSend = '{ "user": "' + user + '" }';  
					var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/rob', method: 'POST', 
						headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataToSend) } }, function(res) {
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
									ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
								}
							} else {  
								try {
									var data = JSON.parse(body);
									var response = '';
									if (data.won) {
										response += 'You won!! You stole **' + printGold(Math.floor(data.amount)) + 'g** from <@' + user + '>!';
									} else {
										response += '<@' + user + '> won!! You lost **' + printGold(Math.floor(data.amount)) + 'g**!';
									} 
									ev.channel.send(response);
								} catch (err) {
									console.error(err);
									ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
								}
							}
						});
					});
					request.on('error', function(err) {
						console.error(err);
						ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
					});
					request.write(dataToSend);
					request.end();
				} else {
					ev.channel.send('You can\'t rob an ally! **Oink!!**');
				}
			}, 500);
		});
	});
};
