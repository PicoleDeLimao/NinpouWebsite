'use strict';

var gameToString = require('./gametostring');
var http = require('http');

function getSlot(index) {
	if (index <= 2) return index + 1;
	else if (index <= 5) return index + 2;
	else if (index <= 8) return index + 3;
	return index;
};

module.exports = function(ev, players) {
	var content = { 'players': players };
	var contentStr = JSON.stringify(content);
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/balance', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': contentStr.length } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			try { 
				var json = JSON.parse(body);
				if (res.statusCode != 200) {
					ev.channel.send(json.error);
				} else { 
					gameToString(ev, json.game, function(gameString) {
						var response = '';
						response += '**Optimal balance (balancing by average points):**\n';
						response += gameString; 
						response += 'To balance this game, type:\n```md\n';
						for (var i = 0; i < json.swaps.length; i++) {
							response += '!swap ' + getSlot(json.swaps[i][0]) + ' ' + getSlot(json.swaps[i][1]) + '\n';
						}
						response += '```';
						ev.channel.send(response);
					}, 'points');
				}
			} catch (err) {
				console.error(err);
				ev.channel.send('Error while balacing game. :( **Oink!** :pig:');
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		return callback('Couldn\'t calculate balance. :( **Oink!** :pig:');
	});
	request.write(contentStr);
	request.end();
};
