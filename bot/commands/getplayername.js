'use strict';

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
				return callback(null, name);
			});
		}).catch(function(err) {
			return callback(null, name);
		});
	} else {  
		return callback(null, name);
	}
};
