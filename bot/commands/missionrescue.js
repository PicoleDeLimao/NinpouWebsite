'use strict';

var http = require('http');
var Discord = require('discord.js');

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
					var response = 'You won **' + data.amount + 'g**!';
					if (data.streak)
						response += ' STREAK BONUS!';
					if (data.double) 
						response += ' DOUBLE BONUS!';
					var today = new Date();
					if (today.getDay() == 0 || today.getDay() == 6) {
						response += ' DOUBLE XP TODAY!!';
					}
					//ev.channel.send(response); 
					var img = 'http://www.narutoninpou.com/images/tonton-rescue.png';
					var msgEmbed = new Discord.RichEmbed() 
							.setDescription(response)
							.setFooter('Thank you for rescuing me! **Oink!!** ')
							.setImage(img);
					ev.channel.send(msgEmbed);
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
