var mongoose = require('mongoose');

var threadSchema = mongoose.Schema({
	createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
	section: { type: String, required: true, enum: ['announcements', 'general', 'wc3_suggestions', 'wc3_report', 'wc3_tips', 'dota2_suggestions', 'dota2_report', 'dota2_tips'] },
	title: { type: String, required: true, maxlength: '70' },
	content: { type: String, required: true, maxlength: '1000' },
});

var Thread = mongoose.model('Thread', threadSchema);
module.exports = Thread;