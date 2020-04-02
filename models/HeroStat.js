var mongoose = require('mongoose');

var herostatSchema = mongoose.Schema({
	hero: { type: Number, required: true, unique: true },
	kills: { type: Number, default: 0 },
	deaths: { type: Number, default: 0 },
	assists: { type: Number, default: 0 },
	points: { type: Number, default: 0 },
	gpm: { type: Number, default: 0 },
	wins: { type: Number, default: 0 },
	games: { type: Number, default: 0 },
	score: { type: Number, default: 0 }
});

var HeroStat = mongoose.model('HeroStat', herostatSchema);
module.exports = HeroStat;