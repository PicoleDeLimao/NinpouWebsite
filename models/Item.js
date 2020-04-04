var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
	id: { type: Number, required: true, unique: true, index: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	classification: { type: String, enum: ['weapon', 'armor', 'support', 'consumable'] },
	attackBonus: { type: Number, required: true, default: 0 },
	armorBonus: { type: Number, required: true, default: 0 },
	hpBonus: { type: Number, required: true, default: 0 },
	effects: [{  
		type: { type: String, required: true, enum: ['critical', 'stun', 'silence', 'life_steal', 'instant_kill', 'invulnerability'] },
		triggerChance: { type: Number, required: true, default: 1 },
		effectDuration: { type: Number, required: true, default: 1 },
		damagePerLevel: { type: Number, required: true, default: 0 },
		target: { type: String, required: true, enum: ['you', 'enemy'], default: 'enemy' } 
	}] 
});

var Item = mongoose.model('Item', itemSchema);
module.exports = Item; 
 
