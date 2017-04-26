var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	provider: { type: String, required: true, enum: ['steam', 'local'] },
	displayName: { type: String, required: true },
	steamProfileUrl: String,
	profilePhoto: String,
	countryCode: String,
	bio: { type: String, maxlength: 500 },
	openID: { type: String, unique: true, required: true, query: false },
	isAdmin: { type: Boolean, default: false },
	numThreads: { type: Number, required: true, default: 0 },
	numReplies: { type: Number, required: true, default: 0 },
	lastAccess: Date
});

var User = mongoose.model('User', userSchema);
module.exports = User;