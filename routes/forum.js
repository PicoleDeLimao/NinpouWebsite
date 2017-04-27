'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Section = require('../models/Section');
var Thread = require('../models/Thread');
var User = require('../models/User');

router.get('/stats', function(req, res) {
	Section.aggregate(
	{
		$group: {
			_id: null,
			numThreads: { $sum: '$numThreads' },
			numReplies: { $sum: '$numReplies' }
		}
	},
	{
		$project: {
			numThreads: 1,
			numReplies: 1
		}
	}, function(err, result) {
		if (err) return res.status(500).json(err);
		User.find({}).count().exec(function(err, numUsers) {
			if (err) return res.status(500).json(err);
			User.find({}).sort({ '_id': -1 }).limit(1).exec(function(err, users) {
				if (err) return res.status(500).json(err);
				return res.json({ numThreads: result[0].numThreads, numReplies: result[0].numReplies, numUsers: numUsers, lastUser: users[0] });
			});
		});
	});
});

module.exports = router;