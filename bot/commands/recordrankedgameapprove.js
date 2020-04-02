'use strict';

var canRecord = require('./canrecord');
var getPlayerName = require('./getplayername');
var http = require('http');

module.exports = function(ev, gameId, callback) {
	var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/stats/ranked/' + gameId, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': 0 } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				try { 
					var json = JSON.parse(body);
					callback(json.error);
				} catch (err) {
					console.error(err);
					callback('Error while ranking game. :( **Oink!** :pig:');
				}
			} else { 
				try {
					var data = JSON.parse(body);
					if (data.changes.length > 0) {
						var msg = '```md\nAverage point changes:\n\n';
						(function next(i) {
							if (i == data.changes.length) {
								msg += '```';
								callback(null, msg);
							} else {
								getPlayerName(ev, data.changes[i].alias, function(err, name) {
									msg += name + ': ' + Math.floor(data.changes[i].oldPoints) + ' -> ' + Math.floor(data.changes[i].newPoints) + '\n';
									next(i + 1);
								}, true);
							}
						})(0);
					} else {
						callback(null, "");
					}
				} catch (e) {
					console.error(e);
					callback('Error while ranking game. :( **Oink!** :pig:');
				}
			}
		});
	});
	request.on('error', function(err) {
		console.error(err);
		callback('Error while ranking game. :( **Oink!** :pig:');
	});
	request.write('');
	request.end();
};

 