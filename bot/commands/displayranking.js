'use strict';

var http = require('http');
var getPlayerName = require('./getplayername');

module.exports = function(ev, player, attribute, order) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/ranking/' + (player || '') + '?sort=' + attribute + '&order=' + order }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			if (statusCode != 200) {
				console.error(body);
				ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
				return;
			} 
			try {
				var ranking = JSON.parse(body);
				var maxPlayerName = 0;
				(function next(i, ranking) {
					if (i == ranking.ranking.length) {
						var response = '```pf\n';
						(function next(i, ranking, response) {  
							if (i == ranking.ranking.length) {  
								response += '```\n';
								if (attribute == 'score') 
									response += '**Score formula:** Average points x Chance of Winning\n\n**Tip:** Now you can display ranking sorted by a certain attribute (kills, deaths, assists, points, gpm, wins, games, chance). Example: !ranking kills or !ranking @Player kills. You can also reverse the sort order by adding **\'asc\'** or **\'desc\'** as a last parameter.'; 
								return ev.channel.send(response); 
							} else {
								getPlayerName(ev, ranking.ranking[i]._id, function(err, playerName) { 
									if (err) {
										console.error(err);
										return ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
									} 
									if (player && (ranking.minIndex + i + 1) == ranking.index) {
										response += '>>> ';
									}
									if (attribute != 'score') { 
										var space = ''; 
										for (var x = 0; x < maxPlayerName - playerName.length; x++) {
											space += ' ';
										}  
										response += (ranking.minIndex + i + 1) + '. < ' + playerName + ' >' + space + ' <' + Math.round(ranking.ranking[i][attribute]) + '>\n';
									} else {  
										response += (ranking.minIndex + i + 1) + '. < ' + playerName + ' > with a score of <' + Math.round(ranking.ranking[i].score) + '> and average points of <' + Math.round(ranking.ranking[i].points) + '>\n';
									}
									return next(i + 1, ranking, response);
								});
							}
						})(0, ranking, response); 
					} else { 
						getPlayerName(ev, ranking.ranking[i]._id, function(err, playerName) {
							if (err) {
								console.error(err);
								return ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
							}
							maxPlayerName = Math.max(maxPlayerName, playerName.length); 
							next(i + 1, ranking); 
						});
					}
				})(0, ranking);
				
			} catch (err) { 
				console.error(err);
				ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t fetch ranking. :( **Oink!** :pig:');
	});
};

