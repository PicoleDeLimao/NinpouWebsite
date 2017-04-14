var express = require('express');

var app = express();
app.use(express.static('static'));

var ip = 'localhost';
var port = 8080;
app.listen(port, ip, function() {
	console.log('Listening to ' + ip + ' on port ' + port + '...');
});