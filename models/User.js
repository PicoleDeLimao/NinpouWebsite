var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	provider: { type: String, required: true, enum: ['steam'] },
	displayName: { type: String, required: true },
	steamProfileUrl: String,
	profilePhoto: String,
	countryCode: String,
	openID: { type: String, unique: true, required: true, query: false },
	isAdmin: { type: Boolean, default: false },
	numThreads: { type: Number, required: true, default: 0 },
	numReplies: { type: Number, required: true, default: 0 }
});

var User = mongoose.model('User', userSchema);
module.exports = User;