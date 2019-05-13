'use strict';

var http = require('http'); 

module.exports = function(heroName, callback) {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/heroes/' + heroName }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var data = JSON.parse(body);
				if (statusCode != 200) {
					callback(false);
				} else { 
					callback(true);
				}
			} catch (err) { 
				callback(false);
			}
		});
	}).on('error', function(err) {
		callback(false);
	});
};
