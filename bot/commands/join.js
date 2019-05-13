'use strict';

var http = require('http');
var Discord = require('discord.js');
 
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
					ev.channel.send('Couldn\'t join village. :( **Oink!** :pig:');
				}
			} else { 
				var description;
				if (affiliation == 'konohagakure') {
					description = 'Naruto: Hey!! Are you new? Welcome!! You hungry? The Ichiraku has the best Ramen in the world!! Let\'s go there!! Dattebayo!!'; 
				} else if (affiliation == 'sunagakure') {
					description = 'Temari: Humpf, a newbie, heh? Don\'t expect us to take it easy! Things are hard here. Now, let\'s go meet the Lord Kazekage. Hurry!';
				} else if (affiliation == 'kirigakure') {
					description = 'Chojuro: Oh.. hi! Didn\'t see you here. You new...? Things were pretty sad in the past, but now we are rebuilding. Welcome to your new home!';
				} else if (affiliation == 'kumogakure') {
					description = 'Samui: Hey, you there! Do you think you got what it takes to be here? Let\'s find out. Now come. Lord Raikage wants to see you.';
				} else if (affiliation == 'iwagakure') {
					description = 'Akatsuchi: Oh!! Welcome!!! We don\'t make distinctions among shinobis here, we are all the same stone! heh heh Here, come talk with Lord Ohnoki.';
				} else if (affiliation == 'otogakure') {
					description = 'Kabuto: Huh, so you are new Lord Orochimaru subject? ha ha. He\'s too busy right now, but come in, we certainly have a use for you.';
				} else if (affiliation == 'akatsuki') {
					description = 'Konan: So you are the new missing ninja they were talking about. Welcome to Akatsuki. Our leader wants to speak to you. Follow me.';
				}
				var img = 'http://www.narutoninpou.com/images/welcome-' + affiliation + '.png';
				var msgEmbed = new Discord.RichEmbed() 
						.setDescription('Welcome! Now you are a member of: **' + affiliation.charAt(0).toUpperCase() + affiliation.substr(1) + '**!')
						.setFooter(description)
						.setImage(img);
				ev.channel.send(msgEmbed);
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
							guildRole.name.toLowerCase() == 'akatsuki' ||
							guildRole.name.toLowerCase() == 'shinobi alliance') {
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
						if (villages[village].name.toLowerCase() != affiliation && villages[village].name.toLowerCase() != 'shinobi alliance') {
							member.removeRole(villages[village].id);
						} 
					}
					if (affiliation == 'otogakure' || affiliation == 'akatsuki') {
						member.removeRole(villages['shinobi alliance'].id);
					}
					for (var rank in ranks) {
						if (ranks[rank].name.toLowerCase() != 'genin') {
							member.removeRole(ranks[rank].id);
						}
					}
					member.addRole(ranks['genin'].id);
					member.addRole(villages[affiliation].id);
					if (affiliation == 'konohagakure' || 
						affiliation == 'sunagakure' || 
						affiliation == 'kirigakure' || 
						affiliation == 'kumogakure' || 
						affiliation == 'iwagakure') {
						member.addRole(villages['shinobi alliance'].id);		
					}
				});
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t join village. :( **Oink!** :pig:');
	});
	request.end();
};
