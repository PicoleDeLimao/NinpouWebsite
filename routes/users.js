'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var User = require('../models/User');
var Thread = require('../models/Thread');

router.get('/me', auth.authenticate(), function(req, res) {
	User.update({ _id: req.user._id }, { $set: { lastAccess: new Date() } }, function(err) {
		if (err) return res.status(500).json(err);
		return res.json(req.user);
	});
});

router.get('/:id', function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'User not found' });
	User.findById(req.params.id, function(err, user) {
		if (err) return res.status(500).json(err);
		return res.json(user);
	});
});

router.get('/:id/threads', function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'User not found' });
	var page = req.query.page ? parseInt(req.query.page) || 0 : 0;
	var numDocsPerPage = req.query.limit ? parseInt(req.query.limit) || 20 : 20;
	if (numDocsPerPage > 100 || numDocsPerPage < 1) numDocsPerPage = 20;
	Thread.find({ createdBy: req.params.id }).count().exec(function(err, numThreads) {
		if (err) return res.status(500).json(err);
		Thread.find({ createdBy: req.params.id }, '+section').populate(['createdBy', 'section', 'lastUpdate.updatedBy']).sort({ 'lastUpdate._id': -1 }).skip(page * numDocsPerPage)
		.limit(numDocsPerPage).exec(function(err, threads) {
			if (err) return res.status(500).json(err);
			return res.json({ threads: threads, numThreads: numThreads });
		});
	});
});

router.get('/:id/replies', function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'User not found' });
	var page = req.query.page ? parseInt(req.query.page) || 0 : 0;
	var numDocsPerPage = req.query.limit ? parseInt(req.query.limit) || 20 : 20;
	if (numDocsPerPage > 100 || numDocsPerPage < 1) numDocsPerPage = 20;
	Thread.find({ 'replies.createdBy' : req.params.id }).count().exec(function(err, numThreads) {
		if (err) return res.status(500).json(err);
		Thread.find({ 'replies.createdBy' : req.params.id }, '+section').populate(['createdBy', 'section', 'lastUpdate.updatedBy']).sort({ 'lastUpdate._id': -1 }).skip(page * numDocsPerPage)
		.limit(numDocsPerPage).exec(function(err, threads) {
			if (err) return res.status(500).json(err);
			return res.json({ threads: threads, numThreads: numThreads });
		});
	});
	
});

module.exports = router;