'use strict';

var http = require('http'); 
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
						'Average kills:       <' + Math.round(ranking.stat.kills) + '> (Ranking <' + ranking.rankingKills + '>)\n' + 
						'Average deaths:      <' + Math.round(ranking.stat.deaths) + '> (Ranking <' + ranking.rankingDeaths + '>)\n' + 
						'Average assists:     <' + Math.round(ranking.stat.assists) + '> (Ranking <' + ranking.rankingAssists + '>)\n' + 
						'Average points:      <' + Math.round(ranking.stat.points) + '> (Ranking <' + ranking.rankingPoints + '>)\n' +  
						'Average gold/minute: <' + Math.round(ranking.stat.gpm * 100) + '> (Ranking <' + ranking.rankingGpm + '>)\n' +  
						'Chance of winning:   <' + (ranking.stat.chanceWin * 100).toFixed(2) + '%> (Ranking <' + ranking.rankingChance + '>)\n\n' + 
						'Last game:           ' + ranking.lastGame; 
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
