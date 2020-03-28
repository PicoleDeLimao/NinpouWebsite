'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, attribute) {   
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/ranking/?sort=' + attribute }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) {
			ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
			return;
		} 
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', async function() {
			try {
				var ranking = JSON.parse(body);
				await ev.guild.roles.fetch();
				await ev.guild.members.fetch();
				ev.guild.members.fetch(ev.author.id).then(async function(author) {   
					if (ranking.ranking[0]._id == ev.author.id || author.roles.highest.name.toLowerCase() == 'admin') {
						var role = null; 
						if (attribute == 'score') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'one above all') {
									role = guildRole;
								}
							});
						} else if (attribute == 'kills') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'solo killer') {
									role = guildRole;
								}
							});
						} else if (attribute == 'deaths') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'untouchable') {
									role = guildRole;
								}
							});
						} else if (attribute == 'assists') { 
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'guardian angel') {
									role = guildRole;
								}
							});
						} else if (attribute == 'points') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'legend') {
									role = guildRole;
								}
							});
						} else if (attribute == 'gpm') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'gold farmer') {
									role = guildRole;
								}
							});
						} else if (attribute == 'games') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'can\'t get enough') {
									role = guildRole;
								}
							});
						} else if (attribute == 'chance') {
							ev.guild.roles.cache.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'champion') {
									role = guildRole;
								}
							});
						} 
						ev.guild.members.cache.forEach(async function(member) {
							if (member.id != author.id) {
								member.roles.remove(role);
							}
						});
						await author.roles.add(role);
						return ev.channel.send('Congratulations! From ' + ev.guild.memberCount + ' players, you are the best!!!!! **Oink**!!!');
					} else {
						return ev.channel.send('You are not top ranking!');
					}
				});
			} catch (err) { 
				console.error(err);
				ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
	});
};

