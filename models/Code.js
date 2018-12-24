var mongoose = require('mongoose');

var codeSchema = mongoose.Schema({
	code: { type: String, required: true, unique: true, index: true }
});

var Code = mongoose.model('Code', codeSchema);
module.exports = Code;