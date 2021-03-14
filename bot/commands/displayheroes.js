'use strict';

var http = require('http');

module.exports = function(ev, attribute, months, playerId) { 
	if (attribute != 'kills' && attribute != 'deaths' && attribute != 'assists' && attribute != 'points' && attribute != 'gpm' && attribute != 'score' && attribute != 'chance' && attribute != 'games') attribute = 'points';
	if (!months || months <= 0) months = 3;
	var url = '/heroes/ranking?months=' + months;
	if (playerId) url += '&player=' + playerId;
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: url }, function(res) {
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			var statusCode = res.statusCode;
			if (statusCode != 200) {
				console.log(body);
				ev.channel.send('Couldn\'t fetch heroes. :( **Oink!** :pig:');
				return;
			} 
			try {
				var ranking = JSON.parse(body);
				ranking.sort(function(a, b) {
					if (attribute == 'deaths') {
						return a['deaths'] - b['deaths'];
					} else {
						return b[attribute] - a[attribute];
					}
				});
				var begin = 0;
				while (begin < ranking.length) {
					var response = '```pf\nStats from the last ' + months + ' months:\n';
					for (var i = begin; i < Math.min(begin + 30, ranking.length); i++) {
						response += (i + 1) + '. < ' + (ranking[i].hero && ranking[i].hero.name || 'Unknown') + ' >. Average ' + attribute + ': <' + Math.round(ranking[i][attribute]) + '>. Wins: <' + ranking[i].wins + '/' + ranking[i].games + '> <' + Math.round(ranking[i].wins / ranking[i].games * 100) + '%>\n';
					}
					response += '```';
					ev.channel.send(response);
					begin += 30;
				}
			} catch (err) { 
				console.error(err);
				ev.channel.send('Couldn\'t fetch heroes. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch heroes. :( **Oink!** :pig:');
	});
};

