'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Thread = require('../models/Thread');

router.post('/:section', auth.authenticate(), function(req, res) {
	if (req.params.section == 'announcements' && !req.user.isAdmin) {
		return res.status(403).send('Only admins can create threads in this section');
	}
	var thread = new Thread({
		createdBy: req.user._id,
		section: req.params.section,
		title: req.body.title,
		content: req.body.content
	});
	thread.save(function(err) {
		if (err) return res.status(400).json(err);
		return res.status(201).json({ _id: thread._id });
	});
});

router.get('/:section', function(req, res) {
	var query = { section: req.params.section };
	if (req.query.lastSeen) {
		query['_id'] = { $lt: req.query.lastSeen };
	}
	Thread.find(query).sort({ _id: -1 }).limit(20).exec(function(err, threads) {
		return res.json(threads);
	});
});

router.get('/:section/:id', function(req, res) {
	Thread.findById(req.params.id, function(err, thread) {
		if (err) return res.status(400).json(err);
		else if (!thread) return res.status(404).send('Thread not found');
		return res.json(thread);
	});
});

router.get('/me', auth.authenticate(), function(req, res) {
	res.json(req.user);
});

module.exports = router;