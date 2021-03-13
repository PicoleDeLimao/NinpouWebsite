'use strict';

var mongoose = require('mongoose');
var express = require('express');
var Jimp = require('jimp');
var router = express.Router();
var Alias = require('../models/Alias');
var BlockedAlias = require('../models/BlockedAlias');
var Stat = require('../models/Stat');
var Item = require('../models/Item'); 
var StatCalculator = require('./statcalculator');

var characters = {
	'naruto': {
		'level': 1,
		'gold': 0
	},
	'sasuke': {
		'level': 1,
		'gold': 0
	},
	'sakura': {
		'level': 1,
		'gold': 0
	},
	'sai': {
		'level': 1,
		'gold': 0
	},
	'hinata': {
		'level': 5,
		'gold': 10000
	},
	'neji': {
		'level': 5,
		'gold': 10000
	},
	'lee': {
		'level': 5,
		'gold': 10000
	},
	'shino': {
		'level': 5,
		'gold': 10000
	},
	'kiba': {
		'level': 5,
		'gold': 10000
	},
	'tenten': {
		'level': 5,
		'gold': 10000
	},
	'ino': {
		'level': 5,
		'gold': 10000
	},
	'shikamaru': {
		'level': 5,
		'gold': 10000
	},
	'chouji': {
		'level': 5,
		'gold': 10000
	},
	'gaara': {
		'level': 5,
		'gold': 10000
	},
	'kankuro': {
		'level': 5,
		'gold': 10000
	},
	'temari': {
		'level': 5,
		'gold': 10000
	},
	'asuma': {
		'level': 10,
		'gold': 100000
	},
	'kurenai': {
		'level': 10,
		'gold': 100000
	},
	'yamato': {
		'level': 10,
		'gold': 100000
	},
	'kabuto': {
		'level': 15,
		'gold': 500000
	},
	'kimimaro': {
		'level': 15,
		'gold': 500000
	},
	'hanzo': {
		'level': 15,
		'gold': 500000
	},
	'haku': {
		'level': 15,
		'gold': 500000
	},
	'zabuza': {
		'level': 15,
		'gold': 500000
	},
	'jiraiya': {
		'level': 20,
		'gold': 1000000
	},
	'tsunade': {
		'level': 20,
		'gold': 1000000
	},
	'orochimaru': {
		'level': 20,
		'gold': 1000000
	},
	'yugito': {
		'level': 25,
		'gold': 2000000
	},
	'yagura': {
		'level': 25,
		'gold': 2000000
	},
	'roshi': {
		'level': 25,
		'gold': 2000000
	},
	'han': {
		'level': 25,
		'gold': 2000000
	},
	'utakata': {
		'level': 25,
		'gold': 2000000
	},
	'fuu': {
		'level': 25,
		'gold': 2000000
	},
	'sasori': {
		'level': 25,
		'gold': 3500000
	},
	'deidara': {
		'level': 25,
		'gold': 3500000
	},
	'hidan': {
		'level': 25,
		'gold': 3500000
	},
	'kakuzu': {
		'level': 25,
		'gold': 3500000
	},
	'konan': {
		'level': 25,
		'gold': 3500000
	},
	'kisame': {
		'level': 35,
		'gold': 5000000
	},
	'kakashi': {
		'level': 35,
		'gold': 5000000
	},
	'gai': {
		'level': 35,
		'gold': 5000000
	},
	'a': {
		'level': 35,
		'gold': 5000000
	},
	'bee': {
		'level': 35,
		'gold': 5000000
	},
	'danzo': {
		'level': 40,
		'gold': 7500000
	},
	'mu': {
		'level': 40,
		'gold': 7500000
	},
	'gengetsu': {
		'level': 40,
		'gold': 7500000
	},
	'tobirama': {
		'level': 50,
		'gold': 10000000
	},
	'hiruzen': {
		'level': 50,
		'gold': 10000000
	},
	'minato': {
		'level': 75,
		'gold': 100000000
	},
	'obito': {
		'level': 75,
		'gold': 100000000
	},
	'itachi': {
		'level': 75,
		'gold': 100000000
	},
	'nagato': {
		'level': 75,
		'gold': 100000000
	},
	'madara': {
		'level': 100,
		'gold': 1000000000
	},
	'hashirama': {
		'level': 100,
		'gold': 1000000000
	},
	'kaguya': {
		'level': 150,
		'gold': 10000000000
	}
};

var summons = {
	'frog1': {
		'level': 10,
		'gold': 100000
	},
	'frog2': {
		'level': 25,
		'gold': 1000000
	},
	'frog3': {
		'level': 50,
		'gold': 10000000
	},
	'snake1': {
		'level': 10,
		'gold': 100000
	},
	'snake2': {
		'level': 25,
		'gold': 1000000
	},
	'snake3': {
		'level': 50,
		'gold': 10000000
	},
	'slug1': {
		'level': 10,
		'gold': 100000
	},
	'slug2': {
		'level': 50,
		'gold': 10000000
	},
	'hawk': {
		'level': 25,
		'gold': 1000000
	},
	'crow': {
		'level': 25,
		'gold': 1000000
	},
	'dog': {
		'level': 15,
		'gold': 150000
	}
};

var affiliations = {
	'konohagakure': {
		'level': 1,
		'gold': 0
	},
	'sunagakure': {
		'level': 5,
		'gold': 1000
	},
	'kirigakure': {
		'level': 5,
		'gold': 1000
	},
	'kumogakure': {
		'level': 5,
		'gold': 1000
	},
	'iwagakure': {
		'level': 5,
		'gold': 1000
	},
	'otogakure': {
		'level': 15,
		'gold': 10000
	},
	'akatsuki': {
		'level': 50,
		'gold': 10000000
	}
};

function _mergeObjects(obj1, obj2) {
	var level = obj1['level'];
	for (var property in obj2) {
		obj1[property] = obj2[property];
	}
	obj1['level'] = level || 1;
	return obj1;
};

function _addSummon(img, alias, callback) {
	if (alias.summon != 'none') {
		Jimp.read('public/images/5_summon_' + alias.summon + '.png', function(err, summon) {
			if (err) return callback(img);
			img.composite(summon, 0, 0);
			return callback(img);
		});
	} else {
		return callback(img);
	}
};

function _addCharacter(img, alias, callback) {
	if (alias.character != 'none') {
		var level = 1;
		if (alias.rank == 'jounin') {
			level = 2;
		} else if (alias.rank == 'anbu' || alias.rank == 'kage') {
			level = 3;
		}
		Jimp.read('public/images/10_char_' + alias.character + '_' + level + '.png', function(err, character) {
			if (err) return callback(img);
			img.composite(character, 0, 0);
			return callback(img);
		});
	} else {
		return callback(img);
	}
};

router.get('/characters', async function(req, res) {
	var alias = await Alias.find({ });
	var owners = { };
	for (var i = 0; i < alias.length; i++) {
		if (alias[i].character != "none" && alias[i].character) {
			owners[alias[i].character] = alias[i].username;
		}
	}
	return res.json({ owners: owners, characters: characters });
});

router.get('/:alias', async function(req, res) {
	var alias = await Alias.findOne({ $or: [{username: req.params.alias.toLowerCase() }, { alias: req.params.alias.toLowerCase() }] }).lean();
	if (!alias) {
		return res.status(404).json({ error: 'Alias not found.' });
	}
	alias.itemWeapon = alias.itemWeapon || { id: null };
	alias.itemArmor = alias.itemArmor || { id: null };
	alias.itemSupport = alias.itemSupport || { id: null };
	alias.itemConsumables = alias.itemConsumables || [];
	var itemWeapon = await Item.findOne({ id: alias.itemWeapon.id });
	if (itemWeapon) alias.itemWeapon = _mergeObjects(alias.itemWeapon, itemWeapon.toObject());
	if (alias.itemWeapon && !alias.itemWeapon.name) alias.itemWeapon = null;
	var itemArmor = await Item.findOne({ id: alias.itemArmor.id });
	if (itemArmor) alias.itemArmor = _mergeObjects(alias.itemArmor, itemArmor.toObject());
	if (alias.itemArmor && !alias.itemArmor.name) alias.itemArmor = null;
	var itemSupport = await Item.findOne({ id: alias.itemSupport.id });
	if (itemSupport) alias.itemSupport = _mergeObjects(alias.itemSupport, itemSupport.toObject());
	if (alias.itemSupport && !alias.itemSupport.name) alias.itemSupport = null;
	var ids = [];
	for (var i = 0; i < alias.itemConsumables.length; i++) {
		ids.push(alias.itemConsumables[i].id);
	}
	var items = await Item.find({ id: { $in: ids } });
	alias.itemConsumables = items; 
	Jimp.read('public/images/0_bg_' + alias.affiliation + '.png', function (err, img) {
		if (err) return res.json(alias);
		_addSummon(img, alias, function(img) {
			_addCharacter(img, alias, function(img) {
				img.write('public/images/users/' + alias.username + '.png');
				return res.json(alias);
			});
		});
	});
});

router.put('/:username/rank', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'Player not found.' });
	alias.rank =  req.body.rank;
	await alias.save();
	res.send();
});

router.put('/:username/status', async function(req, res) {
	if (!req.params.username) return res.status(404).json({ error: 'Player not found.' });
	else if (!req.body.status) return res.status(400).json({ error: 'Invalid status.' });
	else if (req.body.status.length > 300) return res.status(400).json({ error: 'Maximum status length: 300' });
	var user = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!user) return res.status(404).json({ error: 'Player not found.' });
	user.status = req.body.status;
	await user.save();
	res.send();
});

router.post('/block/:alias', async function(req, res) { 
	if (!req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	var alias = await Alias.findOne({ alias: req.params.alias.toLowerCase() });
	if (alias) {
		return res.status(400).json({ error: 'Alias is already linked to an account.' });
	}
	alias = await BlockedAlias.findOne({ alias: req.params.alias.toLowerCase() });
	if (alias) {
		return res.status(400).json({ error: 'Alias is already blocked.' });
	}
	var blocked = new BlockedAlias({ alias: req.params.alias.toLowerCase() });
	await blocked.save();
	return res.status(201).json(blocked);
});
 
router.delete('/block/:alias', async function(req, res) {
	if (!req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	var alias = await BlockedAlias.findOne({ alias: req.params.alias.toLowerCase() });
	if (!alias) {
		return res.status(400).json({ error: 'Alias is not blocked.' });
	}
	await alias.remove();
	return res.status(200).send();
});
 
router.put('/:username/:alias', async function(req, res) {
	if (!req.params.username || !req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	var alias = await BlockedAlias.findOne({ alias: req.params.alias.toLowerCase() });
	if (alias) {
		return res.status(400).json({ error: 'This alias is blocked.' });
	}
	alias = await Alias.findOne({ alias: req.params.alias.toLowerCase() });
	if (alias) {
		return res.status(400).json({ error: 'Alias is already being used.' });
	}
	alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (alias) {
		alias.alias.push(req.params.alias.toLowerCase());
	} else {
		alias = new Alias({
			username: req.params.username.toLowerCase(),
			alias: [req.params.alias.toLowerCase()]
		});
	}
	await alias.save();
	var stat = await Stat.findOne({ username: req.params.alias.toLowerCase() });
	if (stat) {
		stat.alias = alias.username;
		await stat.save();
	}
	return res.status(201).send();
});
 
router.delete('/:alias', async function(req, res) {
	if (!req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	var alias = await Alias.findOne({ alias: req.params.alias.toLowerCase() });
	for (var i = 0; i < alias.alias.length; i++) {
		if (alias.alias[i].toLowerCase() == req.params.alias.toLowerCase()) {
			alias.alias.splice(i, 1);
		}
	}
	await alias.save();
	var stat = await Stat.findOne({ username: req.params.alias.toLowerCase() });
	if (stat) {
		stat.alias = null;
		await stat.save();
	}
	return res.status(200).json(alias);
});

router.post('/:owner/give', async function(req, res) {
	var owner = await Alias.findOne({ username: req.params.owner.toLowerCase() });
	if (!owner) return res.status(404).json({ error: 'Alias not found.' });
	var user = await Alias.findOne({ username: req.body.user.toLowerCase() });
	if (!user) return res.status(404).json({ error: 'Player not found.' });
	if (owner.gold < req.body.amount) return res.status(400).json({ error: 'You don\'t have that amount!' });
	owner.gold -= req.body.amount;
	user.gold += req.body.amount;
	await owner.save();
	await user.save();
	return res.status(200).send({ amount: owner.gold });
});

router.put('/:username/affiliation/:affiliation', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'Player not found.' });
	if (!affiliations[req.params.affiliation]) return res.status(404).json({ error: 'Affiliation not found.' });
	else if (alias.level < affiliations[req.params.affiliation].level) return res.status(400).json({ error: 'You don\'t have enough level to join this village.' });
	else if (alias.gold < affiliations[req.params.affiliation].gold) return res.status(400).json({ error: 'You don\'t have enough gold to join this village.' });
	alias.affiliation = req.params.affiliation;
	alias.rank = 'genin';
	alias.gold -= affiliations[req.params.affiliation].gold;
	await alias.save();
	return res.status(200).send();
});

router.put('/:username/character/:character', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'Player not found.' });
	else if (!characters[req.params.character]) return res.status(404).json({ error: 'Character not found' });
	else if (alias.level < characters[req.params.character].level) return res.status(400).json({ error: 'You don\'t have enough level to buy this character.' });
	else if (alias.gold < characters[req.params.character].gold) return res.status(400).json({ error: 'You don\'t have enough gold to buy this character.' });
	var buyerStat = await StatCalculator.getPlayerStats(req.params.username);
	var anotherAlias = await Alias.findOne({ character: req.params.character });
	if (!anotherAlias) {
		alias.character = req.params.character;
		alias.gold -= characters[req.params.character].gold;
		await alias.save();
		return res.status(200).send();
	}
	var ownerStat = await StatCalculator.getPlayerStats(anotherAlias.username);
	if (buyerStat.stats.mean < ownerStat.stats.mean) {
		return res.status(400).json({ error: 'This character is already owned by someone with higher score.' });
	}
	anotherAlias.character = "none";
	await anotherAlias.save();
	alias.character = req.params.character;
	alias.gold -= characters[req.params.character].gold;
	await alias.save();
	return res.status(200).send();
});

router.put('/:username/summon/:summon', async function(req, res) {
	var alias = await Alias.findOne({ username: req.params.username.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'Player not found.' });
	else if (!summons[req.params.summon]) return res.status(404).json({ error: 'Summon not found' });
	else if (alias.level < summons[req.params.summon].level) return res.status(400).json({ error: 'You don\'t have enough level to buy this summon.' });
	else if (alias.gold < summons[req.params.summon].gold) return res.status(400).json({ error: 'You don\'t have enough gold to buy this summon.' });
	alias.summon = req.params.summon;
	alias.gold -= summons[req.params.summon].gold;
	await alias.save();
	return res.status(200).send();
});

module.exports = router;
