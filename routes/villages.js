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
        affiliations = { $or: [{ affiliation: 'konohagakure' }, { affiliation: 'sunagakure' }, {affiliation: 'kumogakure' }, { affiliation: 'iwagakure' }, { affiliation: 'kirigakure' }] };
    } else if (name === "oto") {
        affiliations = { affiliation: 'otogakure' };
    } else {
        affiliations = { affiliation: 'akatsuki' };
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
            for (var i = 0; i < stats.length; i++) {
                if (aliasesId[stats[i]._id] !== undefined) {
                    hierarchy[aliasesId[stats[i]._id].rank].push(stats[i]._id);
                }
            }
            return res.json(hierarchy);
        });
    });
});

module.exports = router;