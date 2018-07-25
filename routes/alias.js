'use strict';

var mongoose = require('mongoose');
var express = require('express');
var Jimp = require('jimp');
var router = express.Router();
var Alias = require('../models/Alias');
var BlockedAlias = require('../models/BlockedAlias');
var Stat = require('../models/Stat');
var Item = require('../models/Item'); 

router.get('/fix_affiliation', function(req, res) {
	Alias.find({ }, function(err, alias) {
		for (var i = 0; i < alias.length; i++) {
			alias[i].affiliation = 'none';
			alias[i].rank = 'genin';
			alias[i].character = 'none';
			alias[i].save(function(err) {
				
			});
		}
	}); 
});

router.get('/:alias', function(req, res) {
	Alias.findOne({ $or: [{username: req.params.alias.toLowerCase() }, { alias: req.params.alias.toLowerCase() }] }).lean().exec(function(err, alias) {
		if (err) return res.status(500).json({ error: err }); 
		else if (!alias) return res.status(404).json({ error: 'Alias not found.' }); 
		alias.itemWeapon = alias.itemWeapon || { id: null };
		alias.itemArmor = alias.itemArmor || { id: null };
		alias.itemSupport = alias.itemSupport || { id: null };
		alias.itemConsumables = alias.itemConsumables || [];
		Item.findOne({ id: alias.itemWeapon.id }, function(err, itemWeapon) {
			alias.itemWeapon = itemWeapon;
			Item.findOne({ id: alias.itemArmor.id }, function(err, itemArmor) {
				alias.itemArmor = itemArmor;
				Item.findOne({ id: alias.itemSupport.id }, function(err, itemSupport) {
					alias.itemSupport = itemSupport;
					var ids = [];
					for (var i = 0; i < alias.itemConsumables.length; i++) {
						ids.push(alias.itemConsumables[i].id);
					}
					Item.find({ id: { $in: ids } }, function(err, items) {
						alias.itemConsumables = items; 
						Jimp.read('public/images/0_bg_' + alias.affiliation + '.png', function (err, affiliation) {
							if (err) return res.json(alias);
							if (alias.character != 'none') {
								Jimp.read('public/images/10_char_' + alias.character + '.png', function(err, character) {
									if (err) return res.json(alias);
									affiliation.composite(character, 0, 0);
									affiliation.resize(640, 480);
									affiliation.write('public/images/users/' + alias.username + '.png');
									return res.json(alias);
								});
							} else {
								affiliation.resize(640, 480);
								affiliation.write('public/images/users/' + alias.username + '.png');
								return res.json(alias);
							}
						});
					});
				});
			});
		});
	});
});

router.put('/:username/status', function(req, res) {
	if (!req.params.username) return res.status(404).json({ error: 'Player not found.' });
	else if (!req.body.status) return res.status(400).json({ error: 'Invalid status.' });
	else if (req.body.status.length > 300) return res.status(400).json({ error: 'Maximum status length: 300' });
	Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, user) {
		if (err || !user) return res.status(404).json({ error: 'Player not found.' });
		user.status = req.body.status;
		user.save(function(err) {
			if (err) return res.status(500).json({ error: err });
			return res.status(200).send(); 
		});
	});
});

router.post('/block/:alias', function(req, res) { 
	if (!req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	Alias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (alias) {
			console.log(alias);
			return res.status(400).json({ error: 'Alias is already linked to an account.' });
		} else {
			BlockedAlias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
				if (err) return res.status(500).json({ error: err });
				else if (alias) {
					return res.status(400).json({ error: 'Alias is already blocked.' });
				} else {
					var blocked = new BlockedAlias({ alias: req.params.alias.toLowerCase() });
					blocked.save(function(err) {
						if (err) return res.status(500).json({ error: err });
						return res.status(201).json(blocked);
					});
				}
			});
		}
	}); 
});
 
router.delete('/block/:alias', function(req, res) {
	if (!req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	BlockedAlias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (!alias) {
			return res.status(400).json({ error: 'Alias is not blocked.' });
		} else {
			alias.remove(function(err) {
				if (err) return res.status(500).json({ error: err });
				return res.status(200).send();
			});
		}
	}); 
});
 
router.put('/:username/:alias', function(req, res) {
	if (!req.params.username || !req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	BlockedAlias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (alias) {
			return res.status(400).json({ error: 'This alias is blocked.' });
		} else {
			Alias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
				if (err) return res.status(500).json({ error: err });
				else if (alias) {
					return res.status(400).json({ error: 'Alias is already being used.' });
				} else {
					Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
						if (err) return res.status(500).json({ error: err });
						else if (alias) {
							alias.alias.push(req.params.alias.toLowerCase());
						} else {
							alias = new Alias({
								username: req.params.username.toLowerCase(),
								alias: [req.params.alias.toLowerCase()]
							});
						}
						alias.save(function(err) {
							if (err) return res.status(500).json({ error: err });
							Stat.findOne({ username: req.params.alias.toLowerCase() }, function(err, stat) {
								if (err) return res.status(500).json({ error: err });
								else if (stat) {
									stat.alias = alias.username;
									stat.save(function(err) {
										if (err) return res.status(500).json({ error: err });
										return res.status(201).send();
									});
								} else {
									return res.status(201).send();
								}
							});
						});
					});
				}
			});
		}
	}); 
});
 
router.delete('/:username/:alias', function(req, res) {
	if (!req.params.username || !req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
	Alias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (!alias) return res.status(404).json({ error: 'Alias not found.' });
		Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
			if (err) return res.status(500).json({ error: err });
			for (var i = 0; i < alias.alias.length; i++) {
				if (alias.alias[i].toLowerCase() == req.params.alias.toLowerCase()) {
					alias.alias.splice(i, 1); 
					alias.save(function(err) {
						if (err) return res.status(500).json({ error: err });
						Stat.findOne({ username: req.params.alias.toLowerCase() }, function(err, stat) {
							if (!stat) return res.status(200).json(alias);
							stat.alias = stat.username;
							stat.save(function(err) {
								if (err) return res.status(500).json({ error: err });
								return res.status(200).json(alias);
							});
						});
					});
					return;
				}
			}
			return res.status(404).json({ error: 'Alias is not linked to this account.' });
		});
	});
});

router.post('/:owner/give', function(req, res) {
	Alias.findOne({ username: req.params.owner.toLowerCase() }, function(err, owner) {
		if (err) return res.status(500).json({ error: err });
		else if (!owner) return res.status(404).json({ error: 'Alias not found.' });
		Alias.findOne({ username: req.body.user.toLowerCase() }, function(err, user) {
			if (err) return res.status(500).json({ error: err });
			else if (!user) return res.status(404).json({ error: 'Player not found.' });
			if (owner.gold < req.body.amount) return res.status(400).json({ error: 'You don\'t have that amount!' });
			owner.gold -= req.body.amount;
			user.gold += req.body.amount;
			owner.save(function(err) {
				user.save(function(err) {
					res.status(200).send({ amount: owner.gold }); 
				});
			});
		});
	}); 
});

var affiliations = {
	'konohagakure': {
		'level': 5,
		'gold': 1000
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
		'gold': 1000000
	}
};

router.put('/:username/affiliation/:affiliation', function(req, res) {
	Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (!alias) return res.status(404).json({ error: 'Player not found.' });
		if (!affiliations[req.params.affiliation]) return res.status(404).json({ error: 'Affiliation not found.' });
		if (alias.level < affiliations[req.params.affiliation].level) return res.status(400).json({ error: 'You don\'t have enough level to join this village.' });
		else if (alias.gold < affiliations[req.params.affiliation].gold) return res.status(400).json({ error: 'You don\'t have enough gold to join this village.' });
		alias.affiliation = req.params.affiliation;
		alias.gold -= affiliations[req.params.affiliation].gold;
		alias.save(function(err) {
			if (err) return res.status(400).json({ error: 'Invalid affiliation.' });
			return res.status(200).send();
		});
	});
});

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
	'gaara': {
		'level': 1,
		'gold': 0
	},
	'kakashi': {
		'level': 35,
		'gold': 500000
	},
	'obito': {
		'level': 75,
		'gold': 10000000
	},
	'madara': {
		'level': 100,
		'gold': 100000000
	}
};

router.put('/:username/character/:character', function(req, res) {
	Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (!alias) return res.status(404).json({ error: 'Player not found.' });
		if (!characters[req.params.character]) return res.status(404).json({ error: 'Character not found' });
		else if (alias.level < characters[req.params.character].level) return res.status(400).json({ error: 'You don\'t have enough level to buy this character.' });
		else if (alias.gold < characters[req.params.character].gold) return res.status(400).json({ error: 'You don\'t have enough gold to buy this character.' });
		alias.character = req.params.character;
		alias.gold -= characters[req.params.character].gold;
		alias.save(function(err) {
			if (err) return res.status(500).json({ error: err });
			return res.status(200).send();
		});
	});
});

module.exports = router;
