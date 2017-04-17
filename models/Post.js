var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
	createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
	onThread: { type: mongoose.Schema.ObjectId, ref: 'Thread', required: true },
	content: { type: String, required: true, maxlength: '500' }
});

var Post = mongoose.model('Post', postSchema);
module.exports = Post;