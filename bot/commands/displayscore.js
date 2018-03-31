'use strict';

var http = require('http');
var moment = require('moment
var getPlayerName = require('./getplayername');

module.exports = function(ev, playerName) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/players/' + playerName }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var ranking = JSON.parse(body);
				if (statusCode != 200) {
					ev.channel.send(ranking.error);
				} else {
					getPlayerName(ev, ranking.stat._id, function(err, playerName) {
						if (err) return ev.channel.send('Couldn\'t fetch player score. :( **Oink!**');
						var response = '```md\n';  
						response += '< ' + playerName + ' > is on ranking <' + ranking.ranking + '> with a score of <' + Math.round(ranking.stat.score) + '> and a win percentage of <' + (ranking.stat.wins / ranking.stat.games * 100).toFixed(2) + '%> out of <' + ranking.stat.games + '> games. More info:\n\n' +   
						'Average kills:       <' + Math.round(ranking.stat.kills / ranking.stat.games) + '>\n' + 
						'Average deaths:      <' + Math.round(ranking.stat.deaths / ranking.stat.games) + '>\n' + 
						'Average assists:     <' + Math.round(ranking.stat.assists / ranking.stat.games) + '>\n' + 
						'Average points:      <' + Math.round(ranking.stat.kills / ranking.stat.games * 10 + ranking.stat.assists / ranking.stat.games * 2 - ranking.stat.deaths / ranking.stat.games * 5) + '>\n' +  
						'Average gold/minute: <' + Math.round(ranking.stat.gpm * 100 / ranking.stat.games) + '>\n' +  
						'Chance of winning:   <' + (ranking.stat.chanceWin * 100).toFixed(2) + '%>\n\n' + 
						'Last game:           ' + moment(ranking.lastGame).fromNow(); 
						response += '```';
						ev.channel.send(response);
					});
				}
			} catch (err) { 
				console.error(err); 
				ev.channel.send('This player hasn\'t played in this bot yet. :( **Oink!**');
			}
		});
	}).on('error', function(err) {
		console.error(err);  
		ev.channel.send('Couldn\'t fetch player score. :( **Oink!**');
	});
};
