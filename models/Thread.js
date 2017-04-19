var mongoose = require('mongoose');

var replySchema = mongoose.Schema({
	createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
	contents: { type: String, required: true, maxlength: '500' }
});

var threadSchema = mongoose.Schema({
	createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
	section: { type: mongoose.Schema.ObjectId, ref: 'Section', required: true, index: true, select: false },
	title: { type: String, required: true, maxlength: '70' },
	contents: { type: String, required: true, maxlength: '1000' },
	replies: { type: [replySchema], select: false }
});

var Thread = mongoose.model('Thread', threadSchema);
module.exports = Thread;