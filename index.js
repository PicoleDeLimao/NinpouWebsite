var express = require('express');

var app = express();
app.use(express.static('static'));

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Listening to ' + ip + ' on port ' + port + '...');
});