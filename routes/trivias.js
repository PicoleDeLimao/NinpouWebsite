

var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Trivia = require('../models/TriviaStat');

router.post('/:username', function(req, res) { 
    Trivia.findOne({ username: req.params.username }, function(err, trivia) {
        if (err) return res.status(500).json({ error: err });
        if (!trivia) {
            trivia = new Trivia({
                username: req.params.username
            });
        }
        trivia.answers++;
        trivia.save(function(err) {
            if (err) return res.status(500).json({ error: err });
            res.status(200).send();
        });
    });
});

router.get('/', function(req, res) {
    Trivia.find({ }).sort('-answers').limit(5).exec(function(err, trivias) {
        if (err) return res.status(500).json({ error: err });
        return res.json(trivias);
    });
});

module.exports = router;