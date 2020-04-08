'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, mission) {   
	var villages = { };
	var ranks = { };
	await ev.guild.roles.fetch();
	ev.guild.roles.cache.forEach(function(guildRole) {
		if (guildRole.name.toLowerCase() == 'shinobi alliance' || 
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
	ev.guild.members.fetch(ev.author.id).then(function(member) {  
		var memberVillage = '';
		var memberRole = '';
		ev.member.roles.cache.forEach(function(role) {
			if (role.name.toLowerCase() == 'shinobi alliance' || 
				role.name.toLowerCase() == 'otogakure' ||
				role.name.toLowerCase() == 'akatsuki') {
				memberVillage = role.name.toLowerCase();
			}
			if (role.name.toLowerCase() == 'genin' ||
				role.name.toLowerCase() == 'chunnin' ||
				role.name.toLowerCase() == 'tokubetsu jōnin' || 
				role.name.toLowerCase() == 'jōnin' ||
				role.name.toLowerCase() == 'anbu' ||
				role.name.toLowerCase() == 'kage') {
				memberRole = role.name.toLowerCase();
			}
		});
		if (memberVillage == '') {
			ev.channel.send('You must join a village before doing a rank mission. Type **!villages**. Oink!!');  
			return;
		}
		if (mission == 'chunnin' && memberRole != 'genin') {
			ev.channel.send('You must be a genin to do this mission.');
			return; 
		} else if (mission == 'tokubetsu jōnin' && memberRole != 'chunnin') {
			ev.channel.send('You must be a chunnin to do this mission.');
			return; 
		} else if (mission == 'jōnin' && memberRole != 'tokubetsu jōnin') {
			ev.channel.send('You must be a tokubetsu jounin to do this mission.');
			return; 
		} else if (mission == 'anbu' && memberRole != 'jōnin') {
			ev.channel.send('You must be a jounin to do this mission.');
			return; 
		} else if (mission == 'kage' && memberRole != 'anbu') {
			ev.channel.send('You must be an ANBU to do this mission.');
			return; 
		}
		var missionName = mission;
		if (mission == 'tokubetsu jōnin') missionName = 'tokubetsu';
		else if (mission == 'jōnin') missionName = 'jounin';
		var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/rank/' + missionName, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			}); 
			res.on('end', async function() {
				if (res.statusCode != 200) {
					try {
						var data = JSON.parse(body);
						ev.channel.send(data.error);  
					} catch (err) {
						console.error(err);
						ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
					}
				} else { 
					if (mission == 'kage') {
						await ev.guild.members.fetch();
						ev.guild.members.cache.forEach(function(anotherMember) {
							if (member.user.id != anotherMember.user.id) {
								anotherMember.roles.forEach(function(role) {
									if (role.name.toLowerCase() == memberVillage) {
										anotherMember.roles.forEach(async function(anotherRole) {
											if (anotherRole.name.toLowerCase() == 'kage') {
												anotherMember.roles.remove(ranks['kage']);
												anotherMember.roles.add(ranks['genin']);
												http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + anotherMember.user.id + '/rank/genin', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }).end();
											}
										});
									}
								}); 
							}
						});
					} 
					for (var rank in ranks) {
						if (ranks[rank].name.toLowerCase() != mission) {
							await member.roles.remove(ranks[rank]);
						}
					}
					await member.roles.add(ranks[mission]);
					ev.channel.send('Congratulation!! You are now: **' + (mission.charAt(0).toUpperCase() + mission.substr(1)) + '**! Oink!!');  
				} 
			});
		});
		request.on('error', function(err) {
			console.error(err);
			ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
		});
		request.end();
	});
};

