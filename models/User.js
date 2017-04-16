var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	provider: String,
	displayName: String,
	steamProfileUrl: String,
	profilePhoto: String,
	countryCode: String,
	openID: { type: String, unique: true }	
});

var User = mongoose.model('User', userSchema);
module.exports = User;