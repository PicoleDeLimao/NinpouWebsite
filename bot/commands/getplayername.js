'use strict';

var http = require('http');

module.exports = function(ev, name, callback, hideRole) {
	if (!name) return callback(null, null);
	if (!isNaN(parseInt(name))) {
		ev.client.fetchUser(name).then(function(user) {
			ev.guild.fetchMember(user).then(function(member) { 
				member.roles.sort(function(a, b) {
					return b.position - a.position;
				}); 
				var roleName = '';
				member.roles.forEach(function(role) {
					if (roleName == '') {
						if (role.hoist) {
							roleName = role.name;
						}
					}
				}); 
				return callback(null, member.displayName + (hideRole ? '' : ' (' + roleName.replace('ū', 'uu').replace('ō', 'ou') + ')' )); 
			}).catch(function(err) { 
				http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + name, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('end', function() { 
						if (res.statusCode != 200) { 
							console.err(body);
							return callback(null, user.username + ' (LEFT)');
						} else {
							try { 
								var data = JSON.parse(body); 
								return callback(null, data.alias[0] + ' (LEFT)');
							} catch (err) {
								console.err(err);
								return callback(null, user.username + ' (LEFT)');
							}
						}
					});
				}).end();
			});
		}).catch(function(err) {
			return callback(null, name);
		});
	} else {  
		return callback(null, name);
	}
};
