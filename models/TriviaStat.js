var mongoose = require('mongoose');

var triviaStatSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	answers: { type: Number, default: 0},
});
 
var TriviaStat = mongoose.model('TriviaStat', triviaStatSchema);
module.exports = TriviaStat;