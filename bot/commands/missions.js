'use strict';

var http = require('http');

var missions = {
	'rescue'   : '[ Daily] [D-Rank] < !mission rescue >          : Rescue Tonton and be rewarded with <10g>! (<10%> chance to double)',
	'gamble'   : '[ Daily] [D-Rank] < !mission gamble > <amount> : Gamble with Tsunade and have <50%> to get double or lose it all',
	'rob'      : '[ Daily] [D-Rank] < !mission rob > <user>      : You have <50%> chance to rob <min(10% your gold, 10% user gold)> or lose it to him',
	'play'     : '[ Daily] [D-Rank] < !mission play >            : Play a game be rewarded with <50g> and <10%> xp',
	'win'      : '[ Daily] [C-Rank] < !mission win >             : Win a game be rewarded with <200g> and <20%> xp',
	'farm3k'   : '[ Daily] [B-Rank] < !mission farm >            : Play a game with over 3k gpm and be rewarded with <500g> and <20%> xp',
	'kills20'  : '[ Daily] [B-Rank] < !mission assassin >        : Play a game with over 20 kills and be rewarded with <500g> and <20%> xp',
	'deaths5'  : '[ Daily] [B-Rank] < !mission untouchable >     : Play a game with less 5 deaths and be rewarded with <500g> and <20%> xp',
	'assists15': '[ Daily] [B-Rank] < !mission angel >           : Play a game with over 15 assists and be rewarded with <500g> and <20%> xp',
	'top'      : '[Weekly] [S-Rank] < !mission top >             : Be Top-1 on ranking in the end of week and be rewarded with <1000g> and <100%> xp',
};

var missionsAllTime =	'[     -] [S-Rank] < !mission title-score >     : Be Top-1 on score ranking and get the "One above all" title\n' + 
						'[     -] [S-Rank] < !mission title-kills >     : Be Top-1 on kills ranking and get the "Solo killer" title\n' + 
						'[     -] [S-Rank] < !mission title-deaths >    : Be Top-1 on deaths ranking and get the "Untouchable" title\n' + 
						'[     -] [S-Rank] < !mission title-assists >   : Be Top-1 on assists ranking and get the "Guardian angel" title\n' + 
						'[     -] [S-Rank] < !mission title-points>     : Be Top-1 on points ranking and get the "Legend" title\n' + 
						'[     -] [S-Rank] < !mission title-gpm>        : Be Top-1 on gpm ranking and get the "Gold farmer" title\n' + 
						'[     -] [S-Rank] < !mission title-games>      : Be Top-1 on games ranking and get the "Can\'t get enough" title\n' + 
						'[     -] [S-Rank] < !mission title-chance>     : Be Top-1 on chance of winning ranking and get the "Champion" title';
						
module.exports = function(ev) {  
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/available', method: 'GET', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				try {
					var data = JSON.parse(body);
					ev.channel.send(data.error); 
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t available missions. :( **Oink!**');
				}
			} else {  
				try {
					var data = JSON.parse(body);
					var response = '**Oink, oink!**\nHere\'s the list of available missions (' + (data.length + 8) + ' available):\n```md\n';
					for (var i = 0; i < data.length; i++) {
						response += missions[data[i]] + '\n';
					}
					response += missionsAllTime;
					response += '```';
					ev.channel.send(response);
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t list available missions. :( **Oink!**');
				} 
			}
		});
	}); 
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t list streams. :( **Oink!**');
	});
	request.end();
};
