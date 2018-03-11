'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Alias = require('../models/Alias');
var Stat = require('../models/Stat');

router.get('/:alias', function(req, res) {
	Alias.findOne({ $or: [{username: req.params.alias.toLowerCase() }, { alias: req.params.alias.toLowerCase() }] }, function(err, alias) {
		if (err) return res.status(500).json(err); 
		else if (!alias) return res.status(404).json({ error: 'Alias not found.' });
		return res.json(alias);
	});
});

router.put('/:username/:alias', function(req, res) {
	Alias.findOne({ alias: req.params.alias.toLowerCase() }, function(err, alias) {
		if (err) return res.status(500).json(err);
		else if (alias) {
			return res.status(400).json({ error: 'Alias is already being used.' });
		} else {
			Alias.findOne({ username: req.params.username.toLowerCase() }, function(err, alias) {
				if (err) return res.status(500).json(err);
				else if (alias) {
					alias.alias.push(req.params.alias.toLowerCase());
				} else {
					alias = new Alias({
						username: req.params.username.toLowerCase(),
						alias: [req.params.alias.toLowerCase()]
					});
				}
				alias.save(function(err) {
					if (err) return res.status(500).json(err);
					Stat.findOne({ username: req.params.alias.toLowerCase() }, function(err, stat) {
						if (err) return res.status(500).json(err);
						else if (stat) {
							stat.alias = alias.username;
							stat.save(function(err) {
								if (err) return res.status(500).json(err);
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

module.exports = router;