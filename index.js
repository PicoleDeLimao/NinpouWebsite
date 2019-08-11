'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var auth = require('./config/auth');
var bot = require('./bot/bot');
var Stat = require('./models/Stat');
var Alias = require('./models/Alias');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth.initialize());

var mongooseConnection = process.env.DATABASE_URL || 'mongodb://localhost/narutoninpou';
mongoose.connect(mongooseConnection);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database connection error: '));
db.once('open', function() {
	console.log('Connected to Mongo.');
}); 

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/threads', require('./routes/threads'));
app.use('/sections', require('./routes/sections'));
app.use('/forum', require('./routes/forum'));
app.use('/alias', require('./routes/alias'));
app.use('/games', require('./routes/games'));
app.use('/stats', require('./routes/stats'));
app.use('/streams', require('./routes/streams')); 
app.use('/missions', require('./routes/missions')); 
app.use('/items', require('./routes/items'));  
app.use('/heroes', require('./routes/heroes'));  

app.get('/latest', function(req, res) {
	res.redirect('https://drive.google.com/file/d/1WjFhnK2XhEV9JSQAVh5xwrFkncBN4qQ3/view?usp=sharing');
}); 
   
app.get('/changelog', function(req, res) {
	res.redirect('http://www.narutoninpou.com/#/forum/threads/5d4ec2d911b8060015531929');
});

app.get('/donate', function(req, res) { 
	res.redirect('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3JF66XY2HPUSC');
});
 
var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Listening on port ' + port + '...');
	setInterval(function() {
		Stat.find({ }, function(err, stats) {
			if (err) {
				console.error(err);
				return;
			}
			Alias.find({ }, function(err, alias) {
				if (err) {
					console.error(err);
					return;
				}
				for (var i = 0; i < stats.length; i++) {
					var found = false;
					var oldValue = stats[i].alias;
					for (var j = 0; j < alias.length; j++) {
						for (var k = 0; k < alias[j].alias.length; k++) {
							if (alias[j].alias[k].toLowerCase() == stats[i].username.toLowerCase()) {
								found = true;
							}
						}
						if (found) {
							stats[i].alias = alias[j].username;
							break;
						}
					}
					if (!found) {
						stats[i].alias = stats[i].username;
					}
					if (stats[i].alias != oldValue) {
						stats[i].save();
					}
				}
			});
		});
	}, 60000);
});

