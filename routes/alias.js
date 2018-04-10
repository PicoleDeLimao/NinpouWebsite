'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Alias = require('../models/Alias');
var Stat = require('../models/Stat');
var Item = require('../models/Item'); 

router.get('/reset_alias', function(req, res) {
	Stat.find({ }, function(err, stats) {
		(function fun(index) {
			if (index == stats.length) {
				return res.status(200).send();
			} else {
				Alias.findOne({ alias: stats[index].username.toLowerCase() }, function(err, alias) {
					if (!alias) {
						stats[index].alias = stats[index].username;
						stats[index].save(function(err) {
							
						});
					}
				});
				fun(index + 1);
			}
		})(0);
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
						return res.json(alias);
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

router.put('/:username/:alias', function(req, res) {
	if (!req.params.username || !req.params.alias) return res.status(400).json({ error: 'Alias not found.' });
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

module.exports = router;
