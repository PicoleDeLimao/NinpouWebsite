var mongoose = require('mongoose');

var heroSchema = mongoose.Schema({
	id: { type: Number, required: true },
	name: { type: String, required: true }
});

heroSchema.index({ id: 1 }, { unique: true });

var Hero = mongoose.model('Hero', heroSchema);
module.exports = Hero;
