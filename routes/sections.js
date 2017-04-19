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

router.get('/:section_name', function(req, res) {
	var query = { section: req.section._id };
	if (req.query.lastSeen) {
		query['_id'] = { $lt: req.query.lastSeen };
	}
	Thread.find(query).sort({ _id: -1 }).limit(20).exec(function(err, threads) {
		if (err) return res.status(500).json(err);
		return res.json(threads);
	});
});

router.get('/:section_name/stats', function(req, res) {
	if (req.section.lastThread) {
		Thread.findById(req.section.lastThread, function(err, thread) {
			if (err) return res.status(500).json(err);
			return res.json({ numThreads: req.section.numThreads || 0, numReplies: req.section.numReplies || 0, lastThread: thread });
		});
	} else {
		return res.json({ numThreads: req.section.numThreads || 0, numReplies: req.section.numReplies || 0 });
	}
});

router.get('/:section_name/sticky', function(req, res) {
	Thread.find({ section: req.section._id, sticky: true }, function(err, threads) {
		if (err) return res.status(500).json(err);
		return res.json(threads);
	});
});

module.exports = router;