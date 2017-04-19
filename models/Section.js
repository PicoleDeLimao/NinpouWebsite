var mongoose = require('mongoose');

var sectionSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true, index: true },
	numThreads: { type: Number, required: true, default: 0, min: 0 },
	numReplies: { type: Number, required: true, default: 0, min: 0 },
	lastThread: { type: mongoose.Schema.ObjectId, ref: 'Thread' },
	adminOnly: { type: Boolean, required: true, default: false }
});

var Section = mongoose.model('Section', sectionSchema);
module.exports = Section;