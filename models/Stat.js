var mongoose = require('mongoose');

var statSchema = mongoose.Schema({
	username: { type: String, required: true },
	map: { type: String, required: true },
	kills: { type: Number, default: 0 },
	deaths: { type: Number, default: 0 },
	assists: { type: Number, default: 0 },
	gpm: { type: Number, default: 0 },
	wins: { type: Number, default: 0 },
	games: { type: Number, default: 0 }
});
 
statSchema.index({ username: 1, map: 1 }, { unique: true });

var State = mongoose.model('Stat', statSchema);
module.exports = State;