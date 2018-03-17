'use strict';

var http = require('http');
 
module.exports = function(username, callback) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + username, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() { 
			if (res.statusCode != 200) { 
				return callback(true);
			} else {
				try { 
					var json = JSON.parse(body);
					return callback(null, json.alias); 
				} catch (err) {
					console.error(err);
					return callback(err);
				}
			}
		});
	})
	.on('error', function(err) {
		console.error(err);
		return callback(err);
	}); 
};
