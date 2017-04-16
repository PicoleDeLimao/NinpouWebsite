'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var auth = require('./config/auth');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(auth.initialize());
app.use('/users', require('./routes/users'));

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Listening on port ' + port + '...');
});