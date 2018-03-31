'use strict';

var http = require('http');

module.exports = function(ev, amount) {
	var dataToSend = '{ "amount": ' + amount + ' }';  
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/gamble', method: 'POST', 
		headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataToSend) } }, function(res) {
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
					var response = '';
					if (data.amount < 0) {
						response += 'Tsunade won!! You lost **' + (-data.amount) + 'g**!';
					} else {
						response += 'You won!! You got **' + data.amount + 'g**!';
						if (data.streak)
							response += ' STREAK BONUS!';
						var today = new Date();
						if (today.getDay() == 0 || today.getDay() == 6) {
							response += ' DOUBLE XP TODAY!!';
						}
					} 
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
	request.write(dataToSend);
	request.end();
};
