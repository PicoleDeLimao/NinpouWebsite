'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Alias = require('../models/Alias');
var Stat = require('../models/Stat');
var StatCalculator = require('./statcalculator');
var moment = require('moment');


router.get('/:name', function(req, res) {
    var name = req.params.name;
    if (name !== "shinobi alliance" && name !== "otogakure" && name !== "akatsuki") {
        return res.status(400).json({ error: 'Village not found.' });
    }
    var affiliations;
    if (name === "shinobi alliance") {
        affiliations = { $or: [{ affiliation: 'konohagakure' }, { affiliation: 'sunagakure' }, {affiliation: 'kumogakure' }, { affiliation: 'iwagakure' }, { affiliation: 'kirigakure' }] };
    } else {
        affiliations = { affiliation: name };
    }
    StatCalculator.getAllPlayersRanking(function(err, stats) {
        if (err) return res.status(400).json({ error: err }); 
        Alias.find(affiliations, function(err, aliases) {
            if (err) return res.status(400).json({ error: err }); 
            var aliasesId = {};
            for (var i = 0; i < aliases.length; i++) {
                aliasesId[aliases[i].username] = aliases[i];
            }
            var hierarchy = { 'kage': [], 'anbu': [], 'jounin': [], 'tokubetsu jounin': [], 'chunnin': [], 'genin': [] };
            var usernames = [];
            for (var i = 0; i < stats.length; i++) {
                if (aliasesId[stats[i]._id] !== undefined) {
                    hierarchy[aliasesId[stats[i]._id].rank].push(stats[i]._id);
                    for (var j = 0; j < aliasesId[stats[i]._id].alias.length; j++) {
                        usernames.push(new RegExp(['^', escapeRegExp(aliasesId[stats[i]._id].alias[j]), '$'].join(''), 'i')); 
                    }
                }
            }
            var timePeriod = moment().startOf('month').toDate();
            Game.aggregate([
                {
                    $unwind: '$slots',
                },
                {
                    $match: {
                        'createdAt': { $gt: timePeriod },
                        'slots.username': { $in: usernames },
                        'recorded': true,
                        'ranked': true
                    }
                },
                {
                    $group: {
                        _id: name,
                        kills: { $sum: '$slots.kills' },
                        deaths: { $sum: '$slots.deaths' },
                        assists: { $sum: '$slots.assists' },
                        points: { $sum: '$slots.points' },
                        gpm: { $sum: '$slots.gpm' },
                        wins: { $sum: { $cond: ['$slots.win', 1, 0] } },
                        games: { $sum: 1 }
                    }
                }
            ]).exec(function(err, average) {
                if (err) return res.status(400).json({ error: err }); 
                hierarchy["average"] = average;
                return res.json(hierarchy);
            });
        });
    });
});

module.exports = router;