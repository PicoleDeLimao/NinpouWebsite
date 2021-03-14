'use strict';

var http = require('http');

module.exports = function(ev, name) {
	return new Promise((resolve, reject) => {
		if (!name) resolve(null);
		if (!isNaN(parseInt(name))) {
			var members;
			if (!ev.guild) {
				members = ev.message.guild.members;
			} else {
				members = ev.guild.members;
			}
			members.fetch(name).then(function(member) { 
				var roleName = member.roles.hoist.name;
				return resolve(member.displayName + (hideRole ? '' : ' (' + roleName.replace('ū', 'uu').replace('ō', 'ou') + ')' )); 
			}).catch(function(err) { 
				http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + name, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('end', function() { 
						if (res.statusCode != 200) { 
							console.error(body);
							return resolve('null (LEFT)');
						} else {
							try { 
								var data = JSON.parse(body); 
								return resolve(data.alias[0] + ' (LEFT)');
							} catch (err) {
								console.error(err);
								return resolve(user.username + ' (LEFT)');
							}
						}
					});
				}).end();
			});
		} else {  
			return resolve(name);
		}
	});
};
