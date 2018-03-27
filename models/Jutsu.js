var mongoose = require('mongoose');

var jutsuSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true, index: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
	element: [{ type: String, required: true, default: 'yang', enum: ['katon', 'suiton', 'fuuton', 'doton', 'raiton', 'yin', 'yang'] }],
	cooldown: { type: Number, required: true, default: 1 },
	requirements: [{
		id: { type: Number, required: true },
		levelSkip: { type: Number, required: true }
	}],
	damagePerLevel: { type: Number, required: true, default: 0 },
	effects: [{  
		type: { type: String, required: true, enum: ['critical', 'stun', 'silence', 'instant_kill', 'invulnerability'] },
		triggerChance: { type: Number, required: true, default: 1 },
		effectDuration: { type: Number, required: true, default: 1 },
		damagePerLevel: { type: Number, required: true, default: 0 },
		target: { type: String, required: true, enum: ['you', 'enemy'], default: 'enemy' } 
	}] 
});

var Jutsu = mongoose.model('Jutsu', jutsuSchema);
module.exports = Jutsu; 
