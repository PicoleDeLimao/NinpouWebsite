var mongoose = require('mongoose');

var replySchema = mongoose.Schema({
	createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
	contents: { type: String, required: true, maxlength: '5000' }
});

var updateSchema = mongoose.Schema({
	updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
});

var threadSchema = mongoose.Schema({
	createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
	section: { type: mongoose.Schema.ObjectId, ref: 'Section', required: true, index: true, select: false },
	title: { type: String, required: true, maxlength: '70' },
	contents: { type: String, required: true, maxlength: '10000' },
	replies: { type: [replySchema], select: false },
	sticky: { type: Boolean, required: true, default: false },
	numReplies: { type: Number, required: true, default: 0, min: 0 },
	numViews: { type: Number, required: true, default: 0, min: 0 },
	lastUpdate: { type: updateSchema, required: true }
});

var Thread = mongoose.model('Thread', threadSchema);
module.exports = Thread;