var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
	id: { type: String, required: true, unique: true, index: true },
	gamename: { type: String, required: true },
	map: { type : String, required: true },
	owner: { type: String },
	duration: { type: String },
	slots: [{
		username: { type: String },
		realm: { type: String },
		hero: { type: Number },
		kills: { type: Number },
		deaths: { type: Number },
		win: { type: Boolean },
		state: { type: String, enum: ['LEFT', 'EMPTY', 'PLAYING'] }
	}],
	recorded: { type: Boolean, default: false }
});

var Game = mongoose.model('Game', gameSchema);
module.exports = Game;