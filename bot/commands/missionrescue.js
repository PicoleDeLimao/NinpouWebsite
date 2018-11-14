'use strict';

var http = require('http');
var Discord = require('discord.js');
var moment = require('moment');

module.exports = function(ev, auto, callback) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/missions/' + ev.author.id + '/rescue', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				if (!auto) {
					try {
						var data = JSON.parse(body);
						ev.channel.send(data.error);  
					} catch (err) {
						console.error(err);
						ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
					}
				}
			} else {  
				try {
					var data = JSON.parse(body);
					var response = (auto ? '**' + auto + '**: ' : '') + 'You won **' + Math.floor(data.amount) + 'g**!';
					if (data.streak)
						response += ' STREAK BONUS!';
					if (data.double) 
						response += ' DOUBLE BONUS!';
					var today = moment().utcOffset('+0200');
					if (today.day() == 0 || today.day() == 6) {
						response += ' DOUBLE XP TODAY!!';
					}
					//ev.channel.send(response); 
					var img = 'http://www.narutoninpou.com/images/tonton-rescue.png';
					var msgEmbed = new Discord.RichEmbed() 
							.setDescription(response)
							.setFooter('Thank you for rescuing me! Oink!!')
							.setImage(img);
					ev.channel.send(msgEmbed);
				} catch (err) {
					if (!auto) {
						console.error(err);
						ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
					}
				}
			}
			if (callback) callback();
		});
	});
	request.on('error', function(err) {
		if (!auto) {
			console.error(err);
			ev.channel.send('Couldn\'t complete mission. :( **Oink!**');
		}
	});
	request.end();
};
