'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = async function(ev, mission) {  
	//await ev.guild.members.fetch(); 
	ev.guild.members.cache.forEach(async function(anotherMember) {
		anotherMember.roles.cache.forEach(function(role) {
			var roleName = role.name.toLowerCase();
			var newRank = null;
			if (roleName == 'genin') {
				newRank = 'genin';
			} else if (roleName == 'chunnin') {
				newRank = 'chunnin';
			} else if (roleName == 'tokubetsu jōnin') {
				newRank = 'tokubetsu jounin';
			} else if (roleName == 'jōnin') {
				newRank = 'jounin';
			} else if (roleName == 'anbu') {
				newRank = 'anbu';
			} else if (roleName == 'kage') {
				newRank = 'kage';
			}
			if (newRank) {
				var contents = { rank: newRank };
				var contentsStr = JSON.stringify(contents);
				var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + anotherMember.user.id + '/rank', method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': contentsStr.length } });
				request.write(contentsStr);
				request.end();
			}
		});
	});
	ev.channel.send('Sync!');
};

