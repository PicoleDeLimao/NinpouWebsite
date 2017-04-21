'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Thread = require('../models/Thread');
var Section = require('../models/Section');

router.param('section_name', function(req, res, done, name) {
	Section.findOne({ name: name }, function(err, section) {
		if (err) return res.status(500).json(err);
		else if (!section) return res.status(404).json({ error: 'Could not find any section by this name' });
		req.section = section;
		done();
	});
});

router.param('thread_id', function(req, res, done, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ error: 'Thread not found' });
	Thread.findById(id, '+replies +section', function(err, thread) {
		if (err) return res.status(500).json(err);
		else if (!thread) return res.status(404).json({ error: 'Thread not found' });
		req.thread = thread;
		done();
	});
});

router.post('/:section_name', auth.authenticate(), function(req, res) {
	if (req.section.adminOnly && !req.user.isAdmin) {
		return res.status(403).json({ error: 'Only admins can create threads in this section' });
	}
	var thread = new Thread({
		createdBy: req.user._id,
		section: req.section._id,
		title: req.body.title,
		contents: req.body.contents,
		lastUpdate: {
			updatedBy: req.user._id
		}
	});
	thread.save(function(err) {
		if (err) return res.status(400).json(err);
		req.section.update({ $inc: { numThreads: 1 }, $set: { lastThread: thread._id } }, function(err) {
			if (err) return res.status(500).json(err);
			req.user.update({ $inc: { numThreads: 1 } }, function(err) {
				if (err) return res.status(500).json(err);
				return res.status(201).json(thread);
			});
		});
	});
});

router.get('/:id', function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
	Thread.findById(req.params.id, '+replies +section').populate(['createdBy', 'replies.createdBy', 'section']).exec(function(err, thread) {
		if (!thread) return res.status(404).json({ error: 'Thread not found' });
		thread.update({ $inc: { numViews: 1 } }, function(err) {
			if (err) return res.status(500).json(err);
			return res.json(thread);
		});
	});
});

router.put('/:thread_id', auth.authenticate(), function(req, res) {
	if (req.thread.createdBy != req.user._id && !req.user.isAdmin) return res.status(403).json({ error: 'You don\'t have permission to edit this thread' });
	if (req.body.contents) req.thread.contents = req.body.contents;
	if (req.body.title) req.thread.title = req.body.title;
	req.thread.save(function(err) {
		if (err) return res.status(400).json(err);
		return res.json(req.thread);
	});
});

router.delete('/:thread_id', auth.authenticate(), function(req, res) {
	if (req.thread.createdBy != req.user._id && !req.user.isAdmin) return res.status(403).json({ error: 'You don\'t have permission to remove this thread' });
	req.thread.remove(function(err) {
		if (err) return res.status(500).json(err);
		Section.findById(req.thread.section, function(err, section) {
			if (err) return res.status(500).json(err);
			section.update({ $inc: { numThreads: -1, numReplies: -req.thread.replies.length } }, function(err) {
				if (err) return res.status(500).json(err);
				req.user.update({ $inc: { numThreads: -1 } }, function(err) {
					if (err) return res.status(500).json(err);
					return res.json(req.thread);
				});
			});
		});
	});
});

router.post('/:thread_id/move/:section_name', auth.authenticate(), function(req, res) {
	if (!req.user.isAdmin) return res.status(403).json({ error: 'You don\'t have permission to perform this action' });
	var oldSection = req.thread.section;
	req.thread.section = req.section._id;
	req.thread.save(function(err) {
		if (err) return res.status(500).json(err);
		Section.findById(oldSection, function(err, section) {
			if (err) return res.status(500).json(err);
			section.update({ $inc: { numThreads: -1, numReplies: -req.thread.replies.length } }, function(err) {
				if (err) return res.status(500).json(err);
				req.section.update({ $inc: { numThreads: 1, numReplies: req.thread.replies.length } }, function(err) {
					if (err) return res.status(500).json(err);
					return res.json(req.thread);
				});
			});
		});
	});
});

router.get('/:id/replies', function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
	Thread.findById(req.params.id, '+replies').populate('replies.createdBy').exec(function(err, thread) {
		if (err) return res.status(500).json(err);
		return res.json(thread.replies);
	});
});

router.post('/:thread_id/replies', auth.authenticate(), function(req, res) {
	var reply = {
		createdBy: req.user._id,
		contents: req.body.contents
	};
	req.thread.replies.push(reply);
	req.thread.numReplies = (req.thread.numReplies || 0) + 1;
	req.thread.lastUpdate = {
		updatedBy: req.user._id
	};
	req.thread.save(function(err) {
		if (err) return res.status(400).json(err);
		Section.findById(req.thread.section, function(err, section) {
			if (err) return res.status(500).json(err);
			section.update({ $inc: { numReplies: 1 }, lastThread: req.thread._id }, function(err) {
				if (err) return res.status(500).json(err);
				req.user.update({ $inc: { numReplies: 1 } }, function(err) {
					if (err) return res.status(500).json(err);
					return res.status(201).json(reply);
				});
			});
		});
	});
});

router.put('/:thread_id/replies/:reply_id', auth.authenticate(), function(req, res) {
	var reply = req.thread.replies.id(req.params.reply_id);
	if (!reply) return res.status(404).json({ error: 'Reply not found' });
	else if (reply.createdBy != req.user._id && !req.user.isAdmin) return res.status(403).json({ error: 'You don\'t have permission to edit this reply' });
	reply.contents = req.body.contents;
	req.thread.save(function(err) {
		if (err) return res.status(400).json(err);
		return res.json(reply);
	});
});

router.delete('/:thread_id/replies/:reply_id', auth.authenticate(), function(req, res) {
	var reply = req.thread.replies.id(req.params.reply_id);
	if (!reply) return res.status(404).json({ error: 'Reply not found' });
	else if (reply.createdBy != req.user._id && !req.user.isAdmin) return res.status(403).json({ error: 'You don\'t have permission to remove this reply' });
	reply.remove();
	--req.thread.numReplies;
	req.thread.save(function(err) {
		if (err) return res.status(500).json(err);
		Section.findById(req.thread.section, function(err, section) {
			if (err) return res.status(500).json(err);
			section.update({ $inc: { numReplies: -1 } }, function(err) {
				if (err) return res.status(500).json(err);
				req.user.update({ $inc: { numReplies: -1 } }, function(err) {
					if (err) return res.status(500).json(err);
					return res.json(reply);
				});
			});
		});
	});
});

module.exports = router;