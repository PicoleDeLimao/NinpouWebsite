'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Section = require('../models/Section');
var Thread = require('../models/Thread');

router.param('section_name', function(req, res, done, name) {
	Section.findOne({ name: name }, function(err, section) {
		if (err) return res.status(500).json(err);
		else if (!section) return res.status(404).json({ error: 'Could not find any section by this name' });
		req.section = section;
		done();
	});
});

router.get('/', function(req, res) {
	Section.find({}).populate({ path: 'lastThread', populate: { path: 'lastUpdate.updatedBy' } }).exec(function(err, sections) {
		if (err) return res.status(500).json(err);
		var obj = { };
		for (var i = 0; i < sections.length; i++) {
			obj[sections[i].name] = sections[i];
		}
		return res.json(obj);
	});
});

router.get('/:section_name', function(req, res) {
	var query = { section: req.section._id, sticky: false };
	var page = req.query.page ? parseInt(req.query.page) || 0 : 0;
	var numDocsPerPage = req.query.limit ? parseInt(req.query.limit) || 20 : 20;
	if (numDocsPerPage > 100 || numDocsPerPage < 1) numDocsPerPage = 20;
	Thread.find(query).populate(['createdBy', 'lastUpdate.updatedBy']).sort({ 'lastUpdate._id': -1 }).skip(page * numDocsPerPage).limit(numDocsPerPage).exec(function(err, threads) {
		if (err) return res.status(500).json(err);
		return res.json({ threads: threads, section: req.section });
	});
});

router.get('/:section_name/sticky', function(req, res) {
	Thread.find({ section: req.section._id, sticky: true }).populate(['createdBy', 'lastUpdate.updatedBy']).exec(function(err, threads) {
		if (err) return res.status(500).json(err);
		return res.json(threads);
	});
});

module.exports = router;