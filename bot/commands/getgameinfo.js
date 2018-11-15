'use strict';

var http = require('http');
var gameToString = require('./gametostring');
 
module.exports = function(id, callback) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/' + id }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) {
			return callback(statusCode);
		} else { 
			var body = '';
			res.on('data', function(data) {
				body += data; 
			});
			res.on('end', function() { 
				try {
					var game = JSON.parse(body);
					callback(null, game);
				} catch (err) {
					console.error(err);
					return callback(err);
				}
			});
		}
	}).on('error', function(err) {
		console.error(err);
		return callback(err);
	});
};
 