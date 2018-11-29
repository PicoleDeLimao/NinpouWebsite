'use strict';

var http = require('http');
var printGold = require('./printgold');

module.exports = function(ev, player, amount) {
	var data = '{ "user": "' + player + '", "amount": ' + amount + ' }';
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + ev.author.id + '/give', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			try {
				var data = JSON.parse(body);
				if (res.statusCode != 200) {
					ev.channel.send(data.error);
				} else {
					ev.channel.send('Done!! Your current amount is: ' + printGold(Math.floor(data.amount)) + '. **Oink!**');
				}
			} catch (err) {
				console.error(err);
				ev.channel.send('Couldn\'t give gold. :( **Oink!**');
			} 
		});
	});
	request.on('error', function(err) {
		console.error(err);
		ev.channel.send('Couldn\'t add alias. :( **Oink!**');
	});
	request.write(data);
	request.end();
};
