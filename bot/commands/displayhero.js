'use strict';

var http = require('http'); 

module.exports = function(ev, heroName, attribute) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/heroes/' + heroName }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var hero = JSON.parse(body);
				if (statusCode != 200) {
					ev.channel.send(ranking.error);
				} else { 
					var response = '```md\n';  
					response += '< ' + (hero.hero && hero.hero.name || heroName) + ' > is on ranking <' + hero.ranking.score + '> with a score of <' + Math.round(hero.score) + '> and a win percentage of <' + (hero.wins / hero.games * 100).toFixed(2) + '%> out of <' + hero.games + '> games. More info:\n\n' +   
					'Average kills:       <' + Math.round(hero.kills) + '> (Ranking <' + hero.ranking.kills + '>)\n' + 
					'Average deaths:      <' + Math.round(hero.deaths) + '> (Ranking <' + hero.ranking.deaths + '>)\n' + 
					'Average assists:     <' + Math.round(hero.assists) + '> (Ranking <' + hero.ranking.assists + '>)\n' + 
					'Average points:      <' + Math.round(hero.points) + '> (Ranking <' + hero.ranking.points + '>)\n' +  
					'Average gold/minute: <' + Math.round(hero.gpm) + '> (Ranking <' + hero.ranking.gpm + '>)\n' +   
					'Chance of winning:   <' + (hero.chance).toFixed(2) + '%> (Ranking <' + hero.ranking.chance + '>)\n';
					response += '```';  
					ev.channel.send(response);
				}
			} catch (err) { 
				console.error(err); 
				ev.channel.send('Couldn\'t fetch hero. :( **Oink!**');
			}
		});
	}).on('error', function(err) {
		console.error(err);  
		ev.channel.send('Couldn\'t fetch hero. :( **Oink!**');
	});
};
