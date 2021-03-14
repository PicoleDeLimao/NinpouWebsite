var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
	id: { type: String, required: true, unique: true, index: true },
	createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true, unique: true, index: true },
	closed: { type: Boolean, default: false }
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;