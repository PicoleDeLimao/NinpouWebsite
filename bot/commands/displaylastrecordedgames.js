'use strict';

var http = require('http');
var moment = require('moment');

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

module.exports = function(ev) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/recorded' }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) {
			ev.channel.send('Couldn\'t fetch last recorded games. :( **Oink!**');
			return;
		}
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var games = JSON.parse(body);
				var response = '```md\n';
				for (var i = 0; i < games.length; i++) {
					var date = dateFromObjectId(games[i]._id);
					var m = moment(date);
					response += '[' + m.fromNow() + '] <' + games[i].id + '> < ' + games[i].gamename + ' > by <' + games[i].owner + '>\n';
				}
				response += '```';
				ev.channel.send(response);
			} catch (err) {
				console.error(err);
				ev.channel.send('Couldn\'t fetch last recorded games. :( **Oink!**');
			} 
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch last recorded games. :( **Oink!**');
	});
};
  