var mongoose = require('mongoose');

var aliasSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	alias: [String],
	gold: { type: Number, default: 0 },
	level: { type: Number, default: 1 },
	xp: { type: Number, default: 0 } 
});

var Alias = mongoose.model('Alias', aliasSchema);
module.exports = Alias;
