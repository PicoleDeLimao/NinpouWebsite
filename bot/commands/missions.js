'use strict';

var http = require('http');
var Discord = require('discord.js');
var getPlayerName = require('./getplayername');

var missions = {
	'rescue'   : '[ Daily] [D-Rank] < !mission rescue >          : Rescue Tonton and be rewarded with <1% of your gold>! (<10%> chance to double)\n',
	'gamble'   : '[ Daily] [D-Rank] < !mission gamble > <amount> : Gamble with Tsunade and have <50%> (<75%> if dailies mission is completed) to get double or lose it all (max 5% of your gold)\n',
	'rob'      : '[ Daily] [D-Rank] < !mission rob > <user>      : You have <50%> chance to rob <min(5% your gold, 5% user gold)> from someone of enemy village or lose it to him\n',
	'play'     : '[     -] [D-Rank] < !mission play >            : Play a game be rewarded with <50g x lvl / 10> and <10%> xp\n',
	'win'      : '[     -] [C-Rank] < !mission win >             : Win a game be rewarded with <200g x lvl / 10> and <20%> xp\n',
	'farm3k'   : '[ Daily] [B-Rank] < !mission farm >            : Play a game with over <2/2.2/2.5/2.7/3/3.3k> gpm and be rewarded with <500/1000/1500/2000/2500/3000g x lvl / 10> and <20%> xp, according to your rank\n',
	'kills20'  : '[ Daily] [B-Rank] < !mission assassin >        : Play a game with over <10/12/15/17/20/23> kills and be rewarded with <500/1000/1500/2000/2500/3000g x lvl / 10> and <20%> xp, according to your rank\n',
	'deaths5'  : '[ Daily] [B-Rank] < !mission untouchable >     : Play a game with less <13/12/11/10/9/7> deaths and be rewarded with <500/1000/1500/2000/2500/3000g x lvl / 10> and <20%> xp, according to your rank\n',
	'assists10': '[ Daily] [B-Rank] < !mission angel >           : Play a game with over <6/7/8/9/10/12> assists and be rewarded with <500/1000/1500/2000/2500/3000g x lvl / 10> and <20%> xp, according to your rank\n',
	'dailies'  : '[ Daily] [A-Rank] < !mission dailies >         : Complete all missions below S-Rank (except gamble and rob) and be rewarded with <1000/2000/4000/8000/16000/24000g x lvl / 10> and <50%> xp, according to your rank\n',
	'win2'     : '[ Daily] [A-Rank] < !mission win2 >            : Win <2> balanced games in a row and be rewarded with <1000g x lvl / 10> and <20%> xp\n',
	'win3'     : '[ Daily] [A-Rank] < !mission win3 >            : Win <3> balanced games in a row and be rewarded with <2000g x lvl / 10> and <20%> xp\n',
	'win4'     : '[ Daily] [A-Rank] < !mission win4 >            : Win <4> balanced games in a row and be rewarded with <8000g x lvl / 10> and <20%> xp\n',
	'win5'     : '[ Daily] [A-Rank] < !mission win5 >            : Win <5> balanced games in a row and be rewarded with <32000g x lvl / 10> and <20%> xp\n',
	'top'      : '[Weekly] [S-Rank] < !mission top >             : Be Top-1 on ranking in the end of week and be rewarded with <50000g x lvl / 10> and <100%> xp\n',
};

var missionsAllTime =	'[     -] [S-Rank] < !missions titles >          : Display all missions which reward titles\n\n' + 
						'[     -] [S-Rank] < !missions ranks >           : Display all missions which reward ranks\n\n';
						
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
					var response = 'Here\'s the list of available missions (' + data.missions.length + ' available):\n```md\n';
					for (var i = 0; i < data.missions.length; i++) {
						response += missions[data.missions[i]] + '\n';
					}
					response += missionsAllTime;
					response += '```';
					if (data.completed) {
						response += '**You have completed all essential missions. Your chance of gambling has increased by 25%!**\n';
					}
					if (data.affiliation == 'none') {
						ev.channel.send(response);
						return;
					}
					getPlayerName(ev, ev.author.id, function(err, name) {
						var description;
						if (data.affiliation == 'konohagakure') {
							description = 'Tsunade: Hey there, ' + name + '. Here are the missions for today.'; 
						} else if (data.affiliation == 'sunagakure') {
							description = 'Gaara: Oh, ' + name + '. Glad you came. Here are the missions I need you to do today.';
						} else if (data.affiliation == 'kirigakure') {
							description = 'Mei: Oh, ' + name + ', didn\'t see you coming. You are charming today! Here are the missions I require you to do today.';
						} else if (data.affiliation == 'kumogakure') {
							description = 'A: Hey, ' + name + '!! Lazing around!? Go do those missions right now, you fatass!!';
						} else if (data.affiliation == 'iwagakure') {
							description = 'Ohnoki: So, ' + name + ', you want new missions, huh? You think you can deal with these? Now stop bothering me! My back hurts..!!';
						} else if (data.affiliation == 'otogakure') {
							description = 'Orochimaru: There you are, ' + name + ' heh heh. I need you to help with some experiments. Here are things I need you to do.';
						} else if (data.affiliation == 'akatsuki') {
							description = 'Pein: ' + name + ', here are your duties for today.';
						}
						var img = 'http://www.narutoninpou.com/images/mission-' + data.affiliation + '.png?cache=2222';
						var msgEmbed = new Discord.RichEmbed() 
								.setDescription(response)
								.setFooter(description)
								.setImage(img);
						ev.channel.send(msgEmbed);
					}, true);
					//ev.channel.send(response);
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
