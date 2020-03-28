'use strict';

var http = require('http');
var whois_promise = require('./whois_promise');

module.exports = function(ev, alias) { 
	whois_promise(ev, alias).then(function(username) {
		ev.channel.send('<@' + username + '>');
	}).catch(function(err) {
		ev.channel.send(err);
	});
};
