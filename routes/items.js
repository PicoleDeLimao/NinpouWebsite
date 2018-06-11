'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var moment = require('moment');
var Alias = require('../models/Alias'); 
var Item = require('../models/Item');

router.get('/reset', function(req, res) {
	Alias.update({}, {'itemSupport': {}, 'itemArmor': {}, 'itemWeapon': {}, 'gold': 0}, {multi: true});
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
