var mongoose = require('mongoose');

var herostatSchema = mongoose.Schema({
	hero: { type: Number, required: true },
	map: { type: String, required: true },
	kills: { type: Number, default: 0 },
	deaths: { type: Number, default: 0 },
	assists: { type: Number, default: 0 },
	gpm: { type: Number, default: 0 },
	wins: { type: Number, default: 0 },
	games: { type: Number, default: 0 }
});

herostatSchema.index({ hero: 1, map: 1 }, { unique: true });

var HeroStat = mongoose.model('HeroStat', herostatSchema);
module.exports = HeroStat;