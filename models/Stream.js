var mongoose = require('mongoose');

var streamSchema = mongoose.Schema({
	channel: { type: String, required: true, unique: true, index: true }
});

var Stream = mongoose.model('Stream', streamSchema);
module.exports = Stream;
