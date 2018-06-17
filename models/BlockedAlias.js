var mongoose = require('mongoose');

var blockedSchema = mongoose.Schema({
	alias: { type: String, required: true, unique: true, index: true } 
});

var BlockedAlias = mongoose.model('BlockedAlias', blockedSchema);
module.exports = BlockedAlias;
