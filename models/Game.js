var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
	id: { type: String, required: true, unique: true, index: true },
	gamename: { type: String, required: true },
	map: { type : String, required: true },
	slots: [{
		username: { type: String },
		realm: { type: String }
	}]
});

var Game = mongoose.model('Game', gameSchema);
module.exports = Game;