'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var https = require('https');
var Stream = require('../models/Stream');
 
var liveChannels = [];
  
setInterval(function() { 
	Stream.find({ }, function(err, streams) {
		if (err) return;
		var count = streams.length - 1;
		var newLiveChannels = [];
		for (var i = 0; i < streams.length; i++) {
			var channel = streams[i].channel;
			var request = https.request({ host: 'api.twitch.tv', path: '/kraken/streams/' + channel + '?client_id=waz727qcznt48ovp7uo05xckyylxmb', method: 'GET' }, function(res) {
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					try {
						var data = JSON.parse(body);
						if (data['stream']) {// && data['stream']['game'] == 'Warcraft III: The Frozen Throne') {
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
				--count; 
				if (count <= 0) liveChannels = newLiveChannels; 
			});
			request.end();
		}
		if (streams.length == 0) {
			liveChannels = newLiveChannels;  
		}
	}); 
}, 60000);

router.get('/live', function(req, res) {
	return res.json(liveChannels);
}); 

router.get('/', function(req, res) {
	Stream.find({ }, function(err, streams) {
		if (err) return res.status(500).json({ 'error': err });
		return res.json(streams);
	});
});

router.post('/:channel', function(req, res) {
	Stream.findOne({ channel: req.params.channel.toLowerCase() }, function(err, stream) {
		if (err) return res.status(500).json({ 'error': err });
		else if (stream) return res.status(400).json({ 'error': 'Stream is already registered.' });
		var stream = new Stream({ 'channel': req.params.channel.toLowerCase() });
		stream.save(function(err) {
			if (err) return res.status(500).json({ 'error': err });
			return res.status(201).json(stream);
		});
	});
});

router.delete('/:channel', function(req, res) {
	Stream.findOne({ channel: req.params.channel.toLowerCase() }, function(err, stream) {
		if (err) return res.status(500).json({ 'error': err });
		else if (!stream) return res.status(404).json({ 'error': 'Stream not found.' });
		stream.remove(function(err) {
			if (err) return res.status(500).json({ 'error': err });
			return res.status(200).json(stream);
		});
	});
});

module.exports = router;
