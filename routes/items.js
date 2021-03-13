'use strict';

var express = require('express');
var router = express.Router();
var Alias = require('../models/Alias'); 
var Item = require('../models/Item');

function _printGold(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

router.post('/', async function(req, res) {
	var item = new Item(req.body);
	await Item.save();
	return res.status(201).json(item); 
});

router.delete('/:id', async function(req, res) {
	var item = await Item.findOne({ id: req.params.id });
	if (!item) return res.status(404).json({ error: 'Item not found.' });
	await item.remove();
	return res.status(200).json(item); 
}); 

router.get('/:classification', async function(req, res) {
	var items = await Item.find({ classification: req.params.classification }).sort('price');
	return res.status(200).json(items); 
});

router.use('/:alias', async function(req, res, next) {
	var alias = await Alias.findOne({ username: req.params.alias.toLowerCase() });
	if (!alias) return res.status(404).json({ error: 'User not found.' });
	req.alias = alias;
	next(); 
});
 
router.post('/:alias/:type/level', async function(req, res) {
	var times = Math.max(1, parseInt(req.query.times, 0) || 1);
	if (req.params.type == 'weapon') {
		if (!req.alias.itemWeapon) {
			return res.status(400).json({ error: 'You don\'t have a weapon.' });
		} else {
			var item = await Item.findOne({ id: req.alias.itemWeapon.id });
			var cost = item.price * Math.pow(2, (req.alias.itemWeapon.level || 1) + times - 1);
			if (req.alias.gold < cost) {
				return res.status(400).json({ error: 'You don\'t have enough gold (need ' + _printGold(cost) + 'g).' })
			} else {
				req.alias.itemWeapon.level = (req.alias.itemWeapon.level || 1) + times;
				req.alias.gold -= cost;
				await req.alias.save();
				return res.status(200).send('Weapon leveled up! **Oink!** :pig:\nIt\'s now level: ' + req.alias.itemWeapon.level + '\n\n**Balance:** -' + _printGold(cost) + 'g')
			}
		}
	} else if (req.params.type == 'cloth') {
		if (!req.alias.itemArmor) {
			return res.status(400).json({ error: 'You don\'t have a cloth.' });
		} else {
			var item = await Item.findOne({ id: req.alias.itemArmor.id });
			var cost = item.price * Math.pow(2, (req.alias.itemArmor.level || 1) + times - 1);
			if (req.alias.gold < cost) {
				return res.status(400).json({ error: 'You don\'t have enough gold (need ' + _printGold(cost) + 'g).' })
			} else {
				req.alias.itemArmor.level = (req.alias.itemArmor.level || 1) + times;
				req.alias.gold -= cost;
				await req.alias.save();
				return res.status(200).send('Cloth leveled up! **Oink!** :pig:\nIt\'s now level: ' + req.alias.itemArmor.level + '\n\n**Balance:** -' + _printGold(cost) + 'g')
			}
		}
	} else if (req.params.type == 'support') {
		if (!req.alias.itemSupport) {
			return res.status(400).json({ error: 'You don\'t have a support item.' });
		} else {
			var item = await Item.findOne({ id: req.alias.itemSupport.id });
			var cost = item.price * Math.pow(2, (req.alias.itemSupport.level || 1) + times - 1);
			if (req.alias.gold < cost) {
				return res.status(400).json({ error: 'You don\'t have enough gold (need ' + _printGold(cost) + 'g).' })
			} else {
				req.alias.itemSupport.level = (req.alias.itemSupport.level || 1) + times;
				req.alias.gold -= cost;
				await req.alias.save();
				return res.status(200).send('Support item leveled up! **Oink!** :pig:\nIt\'s now level: ' + req.alias.itemSupport.level + '\n\n**Balance:** -' + _printGold(cost) + 'g')
			}
		}
	} else {
		return res.status(400).json({ error: 'Item type not allowed.' });
	}
});

router.use('/:alias/:item_id', async function(req, res, next) {
	var item = await Item.findOne({ id: parseInt(req.params.item_id) });
	if (!item) return res.status(404).json({ error: 'Item not found.' });
	req.item = item;
	next(); 
});

router.post('/:alias/:item_id', async function(req, res) {
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
	await req.alias.save();
	return res.status(200).json(req.alias); 
});

module.exports = router;
