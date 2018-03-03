var mongoose = require('mongoose');

var playerStatSchema = mongoose.Schema({
	username: { type: String, required: true },
	map: { type: String, required: true },
	kills: { type: Number, default: 0 },
	deaths: { type: Number, default: 0 },
	assists: { type: Number, default: 0 },
	gpm: { type: Number, default: 0 },
	wins: { type: Number, default: 0 },
	games: { type: Number, default: 0 }
});
 
playerStatSchema.index({ username: 1, map: 1 }, { unique: true });

var PlayerState = mongoose.model('PlayerStat', playerStatSchema);
module.exports = PlayerState;