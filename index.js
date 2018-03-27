'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var auth = require('./config/auth');
var bot = require('./bot/bot');

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

app.get('/latest', function(req, res) {
	res.redirect('https://drive.google.com/file/d/1hXEcPRWA0JIE7sYTaETQ_4rF6pm1ArVz/view?usp=sharing');
}); 
 
app.get('/changelog', function(req, res) {
	res.redirect('http://www.narutoninpou.com/#/forum/threads/5aa5235173b26d0014e535f8');
});
 
var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Listening on port ' + port + '...');
});

