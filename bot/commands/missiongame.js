'use strict';

var http = require('http');
var moment = require('moment');

module.exports = function(ev, mission) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/' + mission, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
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
					ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
				}
			} else {  
				try {
					var data = JSON.parse(body);
					var response = 'You won **' + data.amount + 'g** and **' + data.xp + ' xp**!';
					if (data.streak)
						response += ' STREAK BONUS!';
					var today = moment().utcOffset('+0200');
					if (today.day() == 0 || today.day() == 6) {
						response += ' DOUBLE XP TODAY!!';
					}
					if (data.levelup)
						response += ' CONGRATULATIONS!! You leveled up. Your current level is now: ' + data.level;
					ev.channel.send(response);  
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
				}
			} 
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
	});
	request.end();
};
