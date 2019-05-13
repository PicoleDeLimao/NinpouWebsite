'use strict';

var http = require('http'); 
var getPlayerName = require('./getplayername');

module.exports = function(ev, heroName, page) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/heroes/' + heroName + '/tip?' + (isNaN(page) ? 0 : page - 1) }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var data = JSON.parse(body);
				if (statusCode != 200) {
					ev.channel.send(data.error);
				} else { 
					var tips = data.tips;
					var nextPage = data.next_page;
					if (tips.length == 0) {
						ev.channel.send('There are no tips for this hero. :(\nHelp us creating one using `!tip ' + heroName + ' <tip>` **Oink!** :pig:');
					} else {
						var response = "";
						(function showTip(index) {
							if (index == tips.length) {
								if (nextPage) {
									response += 'Type `!tips ' + (nextPage + 1) + ' ' + heroName + ' to show the next page of tips.';
								}
								ev.channel.send(response);
							} else {
								getPlayerName(ev, tips[index].sender, function(err, name) {
									response += '**' + name + '**:\n```' + tips[index].tip + '```\n';
									showTip(index + 1);
								});
							}
						})(0);
					}
				}
			} catch (err) { 
				console.error(err); 
				ev.channel.send('Couldn\'t fetch hero tips. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);  
		ev.channel.send('Couldn\'t fetch hero tips. :( **Oink!** :pig:');
	});
};
