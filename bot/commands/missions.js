'use strict';

var http = require('http');

var missions = {
	'rescue'   : '[ Daily] [D-Rank] < !mission rescue >          : Rescue Tonton and be rewarded with <10g>! (<10%> chance to double)',
	'gamble'   : '[ Daily] [D-Rank] < !mission gamble > <amount> : Gamble with Tsunade and have <50%> (<75%> if dailies mission is completed) to get double or lose it all (max 10% of your gold)',
	//'rob'      : '[ Daily] [D-Rank] < !mission rob > <user>      : You have <50% + your level - target level> chance to rob <min(10% your gold, 10% user gold)> or lose it to him',
	'play'     : '[ Daily] [D-Rank] < !mission play >            : Play a game be rewarded with <50g> and <10%> xp',
	'win'      : '[ Daily] [C-Rank] < !mission win >             : Win a game be rewarded with <200g> and <20%> xp',
	'farm3k'   : '[ Daily] [B-Rank] < !mission farm >            : Play a game with over 3k gpm and be rewarded with <500g> and <20%> xp',
	'kills20'  : '[ Daily] [B-Rank] < !mission assassin >        : Play a game with over 20 kills and be rewarded with <500g> and <20%> xp',
	'deaths5'  : '[ Daily] [B-Rank] < !mission untouchable >     : Play a game with less 8 deaths and be rewarded with <500g> and <20%> xp',
	'assists10': '[ Daily] [B-Rank] < !mission angel >           : Play a game with over 10 assists and be rewarded with <500g> and <20%> xp',
	'dailies'  : '[ Daily] [A-Rank] < !mission dailies >         : Complete all missions below S-Rank (except gamble and rob) and be rewarded with <1000g> and <50%> xp',
	'top'      : '[Weekly] [S-Rank] < !mission top >             : Be Top-1 on ranking in the end of week and be rewarded with <10000g> and <100%> xp',
};

var missionsAllTime =	'[     -] [S-Rank] < !missions titles >          : Display all missions which reward titles\n' + 
						'[     -] [S-Rank] < !missions ranks >           : Display all missions which reward ranks\n';
						
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
					var response = '**Oink, oink!**\nHere\'s the list of available missions (' + data.missions.length + ' available):\n```md\n';
					for (var i = 0; i < data.missions.length; i++) {
						response += missions[data.missions[i]] + '\n';
					}
					response += missionsAllTime;
					response += '```';
					if (data.completed) {
						response += '**You have completed all essential missions. Your chance of gambling has increased by 25%!**\n';
					}
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
