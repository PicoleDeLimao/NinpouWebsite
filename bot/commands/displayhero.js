'use strict';

var http = require('http'); 
var getPlayerName = require('./getplayername');

function getMaximumLength(strings, index) {
	var length = 0;
	for (var i = 0; i < strings.length; i++) {
		length = Math.max(length, strings[i][index].length);
	}
	return length + 2;
}

function getStringsFormatted(strings) {
	for (var i = 0; i < strings.length; i++) {
		strings[i] = strings[i].split('\t');
	}
	var lengths = [];
	for (var i = 0; i < strings[0].length; i++) {
		lengths.push(getMaximumLength(strings, i));
	}
	var newStrings = [];
	for (var i = 0; i < strings.length; i++) {
		var str = '';
		for (var j = 0; j < strings[i].length; j++) {
			str += strings[i][j];
			if (j < strings[i].length - 1) {
				for (var k = 0; k < lengths[j] - strings[i][j].length; k++) {
					str += ' ';
				}
			}
		}
		newStrings.push(str);
	}
	return newStrings;
}

module.exports = function(ev, heroName, attribute) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/heroes/' + heroName }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var data = JSON.parse(body);
				var hero = data.stats;
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
					'Chance of winning:   <' + (hero.chance).toFixed(2) + '%> (Ranking <' + hero.ranking.chance + '>)\n\n' +
					'Top-5 best players (from ' + data.numPlayers + ' players):\n';
					if (data.numPlayers > 0) {
						var players = [];
						(function next(index) {
							if (index == data.bestPlayers.length) {
								var strings = getStringsFormatted(players);
								for (var i = 0; i < strings.length; i++) {
									response += strings[i];
								}
								response += '```';  
								ev.channel.send(response);
							} else {
								getPlayerName(ev, data.bestPlayers[index].alias, function(err, playerName) {
									players.push('' + (index + 1) + '.\t' + playerName + '\tKDA: <' + Math.floor(data.bestPlayers[index].kills) + '/' + Math.floor(data.bestPlayers[index].deaths) + '/' + Math.floor(data.bestPlayers[index].assists) + '>\tPoints: <' + Math.floor(data.bestPlayers[index].points) + '>\tVictories: <' + data.bestPlayers[index].wins + '/' + data.bestPlayers[index].games + '>\n');
									next(index + 1);
								});
							}
						})(0);
					}
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
