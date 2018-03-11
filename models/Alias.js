var mongoose = require('mongoose');

var aliasSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	alias: [String]
});

var Alias = mongoose.model('Alias', aliasSchema);
module.exports = Alias;