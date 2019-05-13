'use strict';

var getAliasOf = require('./getaliasof');

module.exports = function(ev, username) { 
	getAliasOf(username, function(err, alias) {
		if (err) { 
			ev.channel.send('This user hasn\'t any linked alias. :( **Oink!** :pig:');
		} else {
			var response = '';
			for (var i = 0; i < alias.length; i++) {
				response += alias[i] + ' ';
			}
			if (response == '') {
				response = 'This user has no alias.';
			}
			ev.channel.send(response); 
		}
	});
};
