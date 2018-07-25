'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, mission) {   
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
	ev.guild.fetchMember(ev.author.id).then(function(member) {  
		var memberVillage = '';
		ev.member.roles.forEach(function(role) {
			if (role.name.toLowerCase() == 'konohagakure' || 
				role.name.toLowerCase() == 'sunagakure' || 
				role.name.toLowerCase() == 'kirigakure' ||
				role.name.toLowerCase() == 'kumogakure' ||
				role.name.toLowerCase() == 'iwagakure' ||
				role.name.toLowerCase() == 'otogakure' ||
				role.name.toLowerCase() == 'akatsuki') {
				memberVillage = role.name.toLowerCase();
			}
		});
		if (memberVillage == '') {
			ev.channel.send('You must join a village before doing a rank mission.');  
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
			res.on('end', function() {
				console.log(body);
				if (res.statusCode != 200) {
					try {
						var data = JSON.parse(body);
						ev.channel.send(data.error);  
					} catch (err) {
						console.error(err);
						ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
					}
				} else { 
					if (mission == 'kage') {
						ev.guild.members.forEach(function(anotherMember) {
							anotherMember.roles.forEach(function(role) {
								if (anotherMember != member && role.name.toLowerCase() == memberVillage) {
									member.removeRole(ranks['kage'].id);
								}
							}); 
						});
					} 
					for (var rank in ranks) {
						member.removeRole(ranks[rank].id);
					}
					member.addRole(ranks[mission].id);
					ev.channel.send('Congratulation!! You are now: **' + (mission.charAt(0).toUpperCase() + mission.substr(1)) + '**! Oink!!');  
				} 
			});
		});
		request.on('error', function(err) {
			console.error(err);
			ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
		});
		request.end();
	});
};

