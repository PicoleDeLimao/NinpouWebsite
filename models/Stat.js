var mongoose = require('mongoose');

var playerStatSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	kills: { type: Number, default: 0 },
	deaths: { type: Number, default: 0 },
	assists: { type: Number, default: 0 },
	points: { type: Number, default: 0 },
	gpm: { type: Number, default: 0 },
	wins: { type: Number, default: 0 },
	games: { type: Number, default: 0 },
	gamesRanked: { type: Number, default: 0 },
	chanceWin: { type: Number, default: 0 },
	score: { type: Number, default: 0 },
	alias: { type: String },
	count: { type: Number, default: 0 },
	lastRankedGame: { type: Date },
	awards: [{
		eventname: { type: String },
		position: { type: Number }
	}]
});
 
var PlayerState = mongoose.model('PlayerStat', playerStatSchema);
module.exports = PlayerState;