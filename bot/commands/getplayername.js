'use strict';

module.exports = function(ev, name, callback) {
	if (!name) return callback(null, null);
	if (!isNaN(parseInt(name))) {
		ev.client.fetchUser(name).then(function(user) {
			ev.guild.fetchMember(user).then(function(member) { 
				return callback(null, member.displayName + ' (' + member.highestRole.name.replace('ū', 'uu').replace('ō', 'ou') + ')'); 
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
