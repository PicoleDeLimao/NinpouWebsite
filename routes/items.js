'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Alias = require('../models/Alias'); 
var Item = require('../models/Item');
var Mission = require('../models/Mission');

router.get('/reset', function(req, res) {
	Alias.find({ }, function(err, alias) {
		(function updateAlias(index) {
			if (index == alias.length) {
				return;
			}
			console.log(alias[index].username);
			Mission.find({ username: alias[index].username }, function(err, missions) {
				var gold = 0;
				for (var i = 0; i < missions.length; i++) {
					var amount = 0;
					if (missions[i].name == 'rescue') {
						amount = 10;
					} else if (missions[i].name == 'play') {
						amount = 50;
					} else if (missions[i].name == 'win') {
						amount = 200;
					} else if (missions[i].name == 'top') {
						amount = 1000;
					}
					gold += amount;
				}
				alias[index].gold = gold;
				alias[index].save(function(err) {
					updateAlias(index + 1);
				});
			});
		})(0);
		
	});
});

router.post('/', function(req, res) {
	var item = new Item(req.body);
	item.save(function(err) {
		if (err) return res.status(400).json({ error: err });
		return res.status(201).json(item); 
	});
});

router.delete('/:id', function(req, res) {
	Item.findOne({ id: req.params.id }, function(err, item) {
		if (err) return res.status(500).json({ error: err });
		else if (!item) return res.status(404).json({ error: 'Item not found.' });
		item.remove(function(err) {
			if (err) return res.status(500).json({ error: err });
			return res.status(200).json(item); 
		});
	});
}); 

router.get('/:classification', function(req, res) {
	Item.find({ classification: req.params.classification }).sort('price').exec(function(err, items) {
		if (err) return res.status(500).json({ error: err });
		return res.status(200).json(items); 
	});
});

router.use('/:alias', function(req, res, next) {
	Alias.findOne({ username: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json({ error: err });
		else if (!alias) return res.status(404).json({ error: 'User not found.' });
		req.alias = alias;
		next(); 
	});
});
 
function printGold(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

router.post('/:alias/:type/level', function(req, res) {
	var times = Math.max(1, parseInt(req.query.times, 2) || 1);
	if (req.params.type == 'weapon') {
		if (!req.alias.itemWeapon) {
			return res.status(400).json({ error: 'You don\'t have a weapon.' });
		} else {
			Item.findOne({ id: req.alias.itemWeapon.id }, function(err, item) {
				if (err) return res.status(400).json({ error: err });
				var cost = item.price * Math.pow(2, (req.alias.itemWeapon.level || 1) + times - 1);
				if (req.alias.gold < cost) {
					return res.status(400).json({ error: 'You don\'t have enough gold (need ' + printGold(cost) + 'g).' })
				} else {
					req.alias.itemWeapon.level = (req.alias.itemWeapon.level || 1) + times;
					req.alias.save(function(err) {
						if (err) return res.status(500).json({ error: err });
						return res.status(200).send('Weapon leveled up! **Oink!** :pig:\nIt\'s now level: ' + req.alias.itemWeapon.level + '\n\n**Balance:** -' + printGold(cost) + 'g')
					});
				}
			});
		}
	} else if (req.params.type == 'cloth') {
		if (!req.alias.itemArmor) {
			return res.status(400).json({ error: 'You don\'t have a cloth.' });
		} else {
			Item.findOne({ id: req.alias.itemArmor.id }, function(err, item) {
				if (err) return res.status(400).json({ error: err });
				var cost = item.price * Math.pow(2, (req.alias.itemArmor.level || 1) + times - 1);
				if (req.alias.gold < cost) {
					return res.status(400).json({ error: 'You don\'t have enough gold (need ' + printGold(cost) + 'g).' })
				} else {
					req.alias.itemArmor.level = (req.alias.itemArmor.level || 1) + times;
					req.alias.save(function(err) {
						if (err) return res.status(500).json({ error: err });
						return res.status(200).send('Cloth leveled up! **Oink!** :pig:\nIt\'s now level: ' + req.alias.itemArmor.level + '\n\n**Balance:** -' + printGold(cost) + 'g')
					});
				}
			});
		}
	} else if (req.params.type == 'support') {
		if (!req.alias.itemSupport) {
			return res.status(400).json({ error: 'You don\'t have a support item.' });
		} else {
			Item.findOne({ id: req.alias.itemSupport.id }, function(err, item) {
				if (err) return res.status(400).json({ error: err });
				var cost = item.price * Math.pow(2, (req.alias.itemSupport.level || 1) + times - 1);
				if (req.alias.gold < cost) {
					return res.status(400).json({ error: 'You don\'t have enough gold (need ' + printGold(cost) + 'g).' })
				} else {
					req.alias.itemSupport.level = (req.alias.itemSupport.level || 1) + times;
					req.alias.save(function(err) {
						if (err) return res.status(500).json({ error: err });
						return res.status(200).send('Support item leveled up! **Oink!** :pig:\nIt\'s now level: ' + req.alias.itemSupport.level + '\n\n**Balance:** -' + printGold(cost) + 'g')
					});
				}
			});
		}
	} else {
		return res.status(400).json({ error: 'Item type not allowed.' });
	}
});

router.use('/:alias/:item_id', function(req, res, next) {
	Item.findOne({ id: parseInt(req.params.item_id) }, function(err, item) {
		if (err) return res.status(500).json({ error: err });
		else if (!item) return res.status(404).json({ error: 'Item not found.' });
		req.item = item;
		next(); 
	});
});

router.post('/:alias/:item_id', function(req, res) {
	if (req.alias.gold < req.item.price) {
		return res.status(400).json({ error: 'You don\'t have enough gold.' });
	}
	if (req.item.classification == 'weapon') {
		req.alias.itemWeapon = req.item;
	} else if (req.item.classification == 'armor') {
		req.alias.itemArmor = req.item;
	} else if (req.item.classification == 'support') {
		req.alias.itemSupport = req.item;
	} else {
		var contains = false; 
		for (var i = 0; i < req.alias.itemConsumables.length; i++) {
			if (req.alias.itemConsumables[i].id == req.item.id) {
				req.alias.itemConsumables[i].amount += 1;
				contains = true;
				break;
			}
		}
		if (!contains) {
			req.alias.itemConsumables.push({ id: req.item.id, amount: 1 }); 
		}
	}
	req.alias.gold -= req.item.price; 
	req.alias.save(function(err) {
		if (err) return res.status(500).json({ error: err });
		return res.status(200).json(req.alias); 
	});
});

module.exports = router;
