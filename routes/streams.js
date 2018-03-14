'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var https = require('https');

var channels = ['twofacekami', 'shiroshura', 'ryusei6', 'brookfest', 'avengerruler', 'teoman7777', 'ghost_tobi', 'manpons'];
var liveChannels = [];
 
setInterval(function() {
	var newLiveChannels = [];
	var count = channels.length;
	for (var i = 0; i < channels.length; i++) {
		var channel = channels[i];
		var request = https.request({ host: 'api.twitch.tv', path: '/kraken/streams/' + channel + '?client_id=waz727qcznt48ovp7uo05xckyylxmb', method: 'GET' }, function(res) {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function() {
				try {
					var data = JSON.parse(body);
					if (data['stream'] && data['stream']['game'] == 'Warcraft III: The Frozen Throne') {
						newLiveChannels.push(data); 
					}
				} catch (err) {
					console.log(err); 
				}
				--count;
				if (count <= 0) liveChannels = newLiveChannels; 
			}); 
		}); 
		request.on('error', function(err) {
			console.log(err); 
			//--count;
			//if (count <= 0) liveChannels = newLiveChannels; 
		});
		request.end();
	}
}, 10000);

router.get('/', function(req, res) {
	return res.json(liveChannels);
}); 

module.exports = router;
