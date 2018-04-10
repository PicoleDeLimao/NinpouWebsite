'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, attribute) {   
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/ranking/?sort=' + attribute }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) {
			ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
			return;
		} 
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var ranking = JSON.parse(body);
				ev.guild.fetchMember(ev.author.id).then(function(author) {   
					if (ranking.ranking[0]._id == ev.author.id || author.highestRole.name.toLowerCase() == 'staff') {
						var role = null; 
						if (attribute == 'score') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'one above all') {
									role = guildRole;
								}
							});
						} else if (attribute == 'kills') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'solo killer') {
									role = guildRole;
								}
							});
						} else if (attribute == 'deaths') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'untouchable') {
									role = guildRole;
								}
							});
						} else if (attribute == 'assists') { 
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'guardian angel') {
									role = guildRole;
								}
							});
						} else if (attribute == 'points') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'legend') {
									role = guildRole;
								}
							});
						} else if (attribute == 'gpm') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'gold farmer') {
									role = guildRole;
								}
							});
						} else if (attribute == 'games') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'can\'t get enough') {
									role = guildRole;
								}
							});
						} else if (attribute == 'chance') {
							ev.guild.roles.forEach(function(guildRole) {
								if (guildRole.name.toLowerCase() == 'champion') {
									role = guildRole;
								}
							});
						} 
						ev.guild.members.forEach(function(member) {
							member.removeRole(role.id);
						});
						author.addRole(role.id);   
						return ev.channel.send('Congratulations! From ' + ev.guild.memberCount + ' players, you are the best!!!!! **Oink**!!!');
					} else {
						return ev.channel.send('You are not top ranking!');
					}
				});
			} catch (err) { 
				console.error(err);
				ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
			}
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
	});
};

