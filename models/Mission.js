var mongoose = require('mongoose');

var missionSchema = mongoose.Schema({
	username: { type: String, required: true },
	name: { type: String, required: true },
	won: { type: Boolean, default: false }
}); 

var Mission = mongoose.model('Mission', missionSchema);
module.exports = Mission;
