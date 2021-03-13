'use strict';

var http = require('http');
var moment = require('moment');

function dateFromObjectId(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
}

module.exports = function(ev, page) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/events' }, function(res) {
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			var statusCode = res.statusCode;
			if (statusCode != 200) {
				console.error(body);
				ev.channel.send('Couldn\'t fetch events. :( **Oink!** :pig:');
				return;
			}
			try {
				var events = JSON.parse(body);
				var response = '```pf\n';
				for (var i = 0; i < events.length; i++) {
					var date = dateFromObjectId(events[i]._id);
					var m = moment(date);
					response += '[' + m.fromNow() + '] <' + events[i].name + '>\n';
				}
				response += '```';
				ev.channel.send(response);
			} catch (err) {
				console.error(err);
				ev.channel.send('Couldn\'t fetch events. :( **Oink!** :pig:');
			} 
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch events. :( **Oink!** :pig:');
	});
};
  