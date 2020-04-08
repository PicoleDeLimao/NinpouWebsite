'use strict';

var http = require('http'); 
var getPlayerName = require('./getplayername');

function getGameString(game) {
	return '<' + game.id + '>\t< ' + (game.hero && game.hero || 'Unknown') + ' >\tKDA: <' + game.kills + '/' + game.deaths + '/' + game.assists + '>\tPoints: <' + game.points + '>\t' + (game.win ? '< VICTORY >' : '< DEFEAT >') + '\t(' + game.date + ')\n';
}

function getHeroString(hero, index) {
	return (index + 1) + '.\t< ' + (hero.hero || 'Unknown') + ' >\tKDA: <' + Math.round(hero.kills) + '/' + Math.round(hero.deaths) + '/' + Math.round(hero.assists) + '>\tPoints: <' + Math.round(hero.points) + '>\tVictories: <' + hero.wins + '/' + hero.games + '>\n';
}

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

function getLastPlayedGames(hero, games, ranked) {
	var response = '';
	if (hero) {
		response += '\nLast 5 ' + (ranked ? 'ranked' : 'not ranked') + ' games (from ' + games.numGames + ' games with this hero):\n';
	} else {
		response += '\nLast 5 ' + (ranked ? 'ranked' : 'not ranked') + ' games (from ' + games.numGames + ' games):\n';
	}
	var allGames = [];
	allGames.push(getGameString(games.bestGame));
	allGames.push(getGameString(games.worstGame));
	for (var i = 0; i < games.lastGames.length; i++) {
		allGames.push(getGameString(games.lastGames[i]));
	}
	var gameStrings = getStringsFormatted(allGames);
	for (var i = 2; i < gameStrings.length; i++) {
		response += gameStrings[i];
	}
	response += '\nBest game:\n';
	if (games.bestGame) {
		response += gameStrings[0];
	}
	response += 'Worst game:\n';
	if (games.worstGame) {
		response += gameStrings[1];
	}
	response + '\n\n';
	return response;
}

module.exports = function(ev, playerName, hist, hero) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/players/' + playerName + ( hero ? '?hero=' + hero : '' ) }, function(res) {
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
						if (err) return ev.channel.send('Couldn\'t fetch player score. :( **Oink!** :pig:');
						var player = ranking.stat;
						var response = '```md\n';  
						response += '< ' + playerName + ' > is on ranking <' + player.ranking.score + '> with a score of <' + Math.round(player.score) + '> and a win percentage of <' + (player.wins / player.gamesRanked * 100).toFixed(2) + '%> out of <' + player.gamesRanked + '> ranked games. More info:\n\n' +   
						'Average kills:       <' + Math.round(player.kills) + '> (Ranking <' + player.ranking.kills + '>)\n' + 
						'Average deaths:      <' + Math.round(player.deaths) + '> (Ranking <' + player.ranking.deaths + '>)\n' + 
						'Average assists:     <' + Math.round(player.assists) + '> (Ranking <' + player.ranking.assists + '>)\n' + 
						'Average points:      <' + Math.round(player.points) + '> (Ranking <' + player.ranking.points + '>)\n' +  
						'Average gold/minute: <' + Math.round(player.gpm) + '> (Ranking <' + player.ranking.gpm + '>)\n' +   
						'Chance of winning:   <' + (player.chance).toFixed(2) + '%> (Ranking <' + player.ranking.chance + '>)\n\n```';
						if (!hist) ev.channel.send(response);
						if (hist && (ranking.ranked.numGames + ranking.notRanked.numGames) > 0) {
							response = '```md\nHistory (last six months):\n\n';
							
							if (hero) {
								response += 'Hero ranking (from ' + ranking.numHeroes + ' played heroes):\n';
								response += getHeroString(ranking.hero, ranking.heroRanking);
							} else if (ranking.bestHeroes.length + ranking.worstHeroes.length + ranking.mostPlayed.length > 0) {
								var allHeroes = [];
								for (var i = 0; i < ranking.bestHeroes.length; i++) {
									allHeroes.push(getHeroString(ranking.bestHeroes[i], i));
								}
								for (var i = 0; i < ranking.worstHeroes.length; i++) {
									allHeroes.push(getHeroString(ranking.worstHeroes[i], i));
								}
								if (ranking.bestHeroes.length + ranking.worstHeroes.length > 0) {
									var heroStrings = getStringsFormatted(allHeroes);
									response += 'Top-5 best heroes (from ' + ranking.numHeroes + ' played heroes):\n';
									for (var i = 0; i < ranking.bestHeroes.length; i++) {
										response += heroStrings[i];
									}
									response += '\nTop-5 worst heroes (from ' + ranking.numHeroes + ' played heroes):\n';
									for (var i = 0; i < ranking.worstHeroes.length; i++) {
										response += heroStrings[ranking.bestHeroes.length + i];
									}
								}
								response += '\nTop-5 most played heroes:\n';
								ranking.numGames = ranking.ranked.numGames + ranking.notRanked.numGames;
								for (var i = 0; i < ranking.mostPlayed.length; i++) {
									response += (i + 1) + '. < ' + ranking.mostPlayed[i].hero + ' > with <' + ranking.mostPlayed[i].games + '> games (' + Math.floor(ranking.mostPlayed[i].games / ranking.numGames * 100) + '% of the games)\n';
								}
								response += '```';
								ev.channel.send(response);
							}
							
							if (ranking.ranked.numGames > 0) {
								response = '```md';
								response += getLastPlayedGames(hero, ranking.ranked, true);
								response += '```';
								ev.channel.send(response);
							}
							if (ranking.notRanked.numGames > 0) {
								response = '```md';
								response += getLastPlayedGames(hero, ranking.notRanked, false);
								response += '```';
								ev.channel.send(response);
							}
						} 
						if (ranking.numGames == 0) {
							ev.channel.send('Nothing to display.');
						}
					});
				}
			} catch (err) { 
				console.error(err); 
				ev.channel.send('This player hasn\'t played in this bot yet. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);  
		ev.channel.send('Couldn\'t fetch player score. :( **Oink!** :pig:');
	});
};
