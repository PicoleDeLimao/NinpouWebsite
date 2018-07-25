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
				ev.guild.fetchMember(ev.author.id).then(function(member) {   
					var villages = { };
					var ranks = { };
					ev.guild.roles.forEach(function(guildRole) {
						if (guildRole.name.toLowerCase() == 'konohagakure' || 
							guildRole.name.toLowerCase() == 'sunagakure' || 
							guildRole.name.toLowerCase() == 'kirigakure' ||
							guildRole.name.toLowerCase() == 'kumogakure' ||
							guildRole.name.toLowerCase() == 'iwagakure' ||
							guildRole.name.toLowerCase() == 'otogakure' ||
							guildRole.name.toLowerCase() == 'akatsuki') {
							villages[guildRole.name.toLowerCase()] = guildRole;
						}
						if (guildRole.name.toLowerCase() == 'genin' ||
							guildRole.name.toLowerCase() == 'chunnin' ||
							guildRole.name.toLowerCase() == 'tokubetsu jōnin' || 
							guildRole.name.toLowerCase() == 'jōnin' ||
							guildRole.name.toLowerCase() == 'anbu' ||
							guildRole.name.toLowerCase() == 'kage') {
							ranks[guildRole.name.toLowerCase()] = guildRole;
						}
					});
					for (var village in villages) {
						if (villages[village].name.toLowerCase() != affiliation) {
							member.removeRole(villages[village].id);
						}
					}
					for (var rank in ranks) {
						member.removeRole(ranks[rank].id);
					}
					member.addRole(ranks['genin'].id);
					member.addRole(villages[affiliation].id);
				});
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t join village. :( **Oink!**');
	});
	request.end();
};
