'use strict';

var http = require('http');
var Discord = require('discord.js');
var printGold = require('./printgold');

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
					ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
				}
			} else {  
				try {
					var data = JSON.parse(body);
					var response = '';
					if (data.amount < 0) {
						var img = 'http://www.narutoninpou.com/images/tsunade-gamble-win.png';
						var msgEmbed = new Discord.MessageEmbed() 
								.setDescription('Tsunade won!! You lost **' + printGold(-data.amount) + 'g**!')
								.setFooter('Ha! That\'s all you got!? Loser!!!')
								.setImage(img);
						ev.channel.send(msgEmbed);
					} else {
						var img = 'http://www.narutoninpou.com/images/tsunade-gamble-lose.png';
						var msgEmbed = new Discord.MessageEmbed() 
								.setDescription('You won!! You got **' + printGold(data.amount) + 'g**!')
								.setFooter('Get out of my sight before I smash your face on the floor!!!')
								.setImage(img);
						ev.channel.send(msgEmbed);
					} 
					//ev.channel.send(response);  
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
				}
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t complete mission. :( **Oink!** :pig:');
	});
	request.write(dataToSend);
	request.end();
};
