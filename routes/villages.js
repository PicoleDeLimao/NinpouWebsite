'use strict';

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Alias = require('../models/Alias');
var Stat = require('../models/Stat');
var StatCalculator = require('./statcalculator');


router.get('/:name', function(req, res) {
    var name = req.params.name;
    console.log(name);
    if (name !== "shinobi alliance" && name !== "otogakure" && name !== "akatsuki") {
        return res.status(400).json({ error: 'Village not found.' });
    }
    var affiliations;
    if (name === "shinobi") {
        affiliations = ['konohagakure', 'sunagakure', 'kumogakure', 'iwagakure', 'kirigakure'];
    } else if (name === "oto") {
        affiliations = ['otogakure'];
    } else {
        affiliations = ['akatsuki'];
    }
    StatCalculator.getAllPlayersRanking(function(err, stats) {
        console.log('a');
        if (err) return res.status(400).json({ error: err }); 
        Alias.find({ affiliation: { $or: affiliations } }, function(err, aliases) {
            console.log('oi');
            if (err) return res.status(400).json({ error: err }); 
            var aliasesId = {};
            for (var i = 0; i < aliases.length; i++) {
                for (var j = 0; j < aliases[i].alias.length; j++) {
                    aliasesId[aliases[i].alias[j]] = aliases[i];
                }
            }
            var hierarchy = { 'kage': [], 'anbu': [], 'jounin': [], 'tokubetsu jounin': [], 'chunnin': [], 'genin': [] };
            for (var i = 0; i < stats.length; i++) {
                if (aliasesId.hasOwnProperty(stats[i]._id)) {
                    hierarchy[aliasesId[stats[i]._id].rank].push(stats[i]._id);
                }
            }
            return res.json(hierarchy);
        });
    });
});

module.exports = router;