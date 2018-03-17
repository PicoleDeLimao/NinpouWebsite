'use strict';

var http = require('http');

module.exports = function(ev) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/rescue', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
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
					var response = 'Thank you for rescuing me! **Oink!!** You won **' + data.amount + 'g**!';
					if (data.streak)
						response += ' STREAK BONUS!';
					if (data.double) 
						response += ' DOUBLE BONUS!';
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
