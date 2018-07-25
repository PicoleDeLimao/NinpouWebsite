var mongoose = require('mongoose');

var aliasSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	alias: [String],
	gold: { type: Number, default: 0 },
	level: { type: Number, default: 1 },
	xp: { type: Number, default: 0 },
	jutsus: [{
		id: { type: Number, required: true },
		level: { type: Number, default: 0 }
	}
	], 
	itemWeapon: { id: Number },
	itemArmor: { id: Number },
	itemSupport: { id: Number },
	itemConsumables: [{
		id: { type: Number, required: true },
		amount: { type: Number, default: 0 }
	}],
	status: { type: String },
	affiliation: { type: String, enum: ['none', 'konohagakure', 'sunagakure', 'kumogakure', 'iwagakure', 'kirigakure', 'otogakure', 'akatsuki'], default: 'none' },
	rank: { type: String, enum: ['genin', 'chunnin', 'jounin', 'anbu', 'kage'], default: 'genin' },
	character: { type: String, enum: ['none', 'naruto', 'sasuke', 'sakura', 'gaara', 'kakashi', 'obito', 'madara'], default: 'none' }
});

var Alias = mongoose.model('Alias', aliasSchema);
module.exports = Alias;
