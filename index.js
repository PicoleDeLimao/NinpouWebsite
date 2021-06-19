'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var auth = require('./config/auth');
var bot = require('./bot/bot');
var Stat = require('./models/Stat');
var Alias = require('./models/Alias');
var Game = require('./models/Game');
var HeroStat = require('./models/HeroStat');
var version = require('./version');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth.initialize());

var mongooseConnection = process.env.DATABASE_URL || 'mongodb://localhost/narutoninpou';
console.log(process.env.DATABASE_URL);
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
app.use('/events', require('./routes/events'));  
app.use('/stats', require('./routes/stats'));
app.use('/streams', require('./routes/streams')); 
app.use('/missions', require('./routes/missions')); 
app.use('/items', require('./routes/items'));  
app.use('/heroes', require('./routes/heroes'));  
app.use('/trivias', require('./routes/trivias'));  
app.use('/villages', require('./routes/villages'));  

app.get('/latest', function(req, res) {
	res.redirect(version.download_link);
}); 
   
app.get('/changelog', function(req, res) {
	res.redirect(version.changelog);
});

app.get('/donate', function(req, res) { 
	res.redirect('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3JF66XY2HPUSC');
})

async function fixAlias(alias) {
	var usernames = alias.alias;
	for (var username of usernames) {
		var stat = await Stat.findOne({ username: username.toLowerCase() });
		if (stat) {
			stat.alias = alias.username;
			await stat.save();
		}
	}
}

async function fixAliases() {
	var aliases = await Alias.find({});
	for (var alias of aliases) {
		fixAlias(alias);
	}
}

var port = process.env.PORT || 8080;
app.listen(port, async function() {
	console.log('Listening on port ' + port + '...');
	setInterval(fixAliases, 1000 * 60 * 60);
	await fixAliases();
});
