'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, player, attribute, order) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/ranking/' + (player || '') + '?sort=' + attribute + '&order=' + order }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) {
			ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
			return;
		} 
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var ranking = JSON.parse(body);
				var response = '```md\n';
				(function next(i, ranking, response) {  
					if (i == ranking.ranking.length) {  
						response += '```\n**Score formula:** Average points x Average GPM x Chance of Winning\n\n**Tip:** Now you can display ranking sorted by a certain attribute (kills, deaths, assists, points, gpm, wins, games, chance). Example: !ranking kills or !ranking @Player kills. You can also reverse the sort order by adding **\'asc\'** or **\'desc\'** as a last parameter.'; 
						return ev.channel.send(response); 
					} else {
						getPlayerName(ev, ranking.ranking[i]._id, function(err, playerName) { 
							if (err) return ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
							if (player && i == ranking.index) {
								response += '>>> ';
							}
							response += (ranking.minIndex + i + 1) + '. < ' + playerName + ' > with a score of <' + Math.round(ranking.ranking[i].score) + '> and win percentage of <' + Math.round(ranking.ranking[i].wins / ranking.ranking[i].games * 100) + '%>\n';
							return next(i + 1, ranking, response);
						});
					}
				})(0, ranking, response);
			} catch (err) { 
				console.error(err);
				ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
			}
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch ranking. :( **Oink!**');
	});
};

