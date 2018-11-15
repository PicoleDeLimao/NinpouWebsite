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
						var player = ranking.stat;
						var response = '```md\n';  
						response += '< ' + playerName + ' > is on ranking <' + player.ranking.score + '> with a score of <' + Math.round(player.score) + '> and a win percentage of <' + (player.wins / player.games * 100).toFixed(2) + '%> out of <' + player.games + '> games. More info:\n\n' +   
						'Average kills:       <' + Math.round(player.kills) + '> (Ranking <' + player.ranking.kills + '>)\n' + 
						'Average deaths:      <' + Math.round(player.deaths) + '> (Ranking <' + player.ranking.deaths + '>)\n' + 
						'Average assists:     <' + Math.round(player.assists) + '> (Ranking <' + player.ranking.assists + '>)\n' + 
						'Average points:      <' + Math.round(player.points) + '> (Ranking <' + player.ranking.points + '>)\n' +  
						'Average gold/minute: <' + Math.round(player.gpm) + '> (Ranking <' + player.ranking.gpm + '>)\n' +   
						'Chance of winning:   <' + (player.chance).toFixed(2) + '%> (Ranking <' + player.ranking.chance + '>)\n\n```';
						ev.channel.send(response);
						if (ranking.lastGames.length > 0) {
							response = '```md\nStatistics (last three months):\n\n';
							if (ranking.bestHeroes) {
								response += 'Top-5 best heroes:\n';
								for (var i = 0; i < ranking.bestHeroes.length; i++) {
									response += (i + 1) + '. < ' + (ranking.bestHeroes[i].hero || 'Unknown') + ' >. Average KDA: <' + Math.round(ranking.bestHeroes[i].kills) + '/' + Math.round(ranking.bestHeroes[i].deaths) + '/' + Math.round(ranking.bestHeroes[i].assists) + '>. Average points: <' + Math.round(ranking.bestHeroes[i].points) + '>\n';
								}
								response += '\nTop-5 worst heroes:\n';
								for (var i = 0; i < ranking.worstHeroes.length; i++) {
									response += (i + 1) + '. < ' + (ranking.worstHeroes[i].hero || 'Unknown') + ' >. Average KDA: <' + Math.round(ranking.worstHeroes[i].kills) + '/' + Math.round(ranking.worstHeroes[i].deaths) + '/' + Math.round(ranking.worstHeroes[i].assists) + '>. Average points: <' + Math.round(ranking.worstHeroes[i].points) + '>\n';
								}
							}
							response += '\nLast 10 games:\n';
							for (var i = 0; i < ranking.lastGames.length; i++) {
								response += '<' + ranking.lastGames[i].id + '>. < ' + (ranking.lastGames[i].hero && ranking.lastGames[i].hero || 'Unknown') + ' > KDA: <' + ranking.lastGames[i].kills + '/' + ranking.lastGames[i].deaths + '/' + ranking.lastGames[i].assists + '>. Points: <' + ranking.lastGames[i].points + '>\t\t(' + ranking.lastGames[i].date + ')\n';
							}
							response += '\nBest game:\n';
							if (ranking.bestGame) {
								response += '<' + ranking.bestGame.id + '>. < ' + (ranking.bestGame.hero && ranking.bestGame.hero || 'Unknown') + ' > KDA: <' + ranking.bestGame.kills + '/' + ranking.bestGame.deaths + '/' + ranking.bestGame.assists + '>. Points: <' + ranking.bestGame.points + '>\t\t(' + ranking.bestGame.date + ')\n';
							}
							response += 'Worst game:\n';
							if (ranking.worstGame) {
								response += '<' + ranking.worstGame.id + '>. < ' + (ranking.worstGame.hero && ranking.worstGame.hero || 'Unknown') + ' > KDA: <' + ranking.worstGame.kills + '/' + ranking.worstGame.deaths + '/' + ranking.worstGame.assists + '>. Points: <' + ranking.worstGame.points + '>\t\t(' + ranking.worstGame.date + ')\n';
							}
							response += '\n\n';
							response += '```';  
							ev.channel.send(response);
						}
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
