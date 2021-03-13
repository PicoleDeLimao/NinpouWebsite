'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Event = require('../models/Event');
var Game = require('../models/Game');
var Alias = require('../models/Alias');

router.post('/', async function (req, res) {
	try {
        var event = await Event.findOne({ name: req.body.event_name.toLowerCase() });
        if (event) return res.status(400).json({ error: 'Event already exists.' });
        event = new Event({
            id: mongoose.Types.ObjectId().toString(),
            name: req.body.event_name.toLowerCase()
        });
        await event.save();
        return res.status(201).json(event);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err });
	}
});

router.get('/', async function (req, res) {
	return res.json(await Event.find());
});

router.get('/:event_name', async function (req, res) {
	var event = await Event.findOne({ name: req.params.event_name.toLowerCase() });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    var games = await Game.aggregate([
        {
            $unwind: '$slots',
        },
        {
            $match: {
                'eventname': req.params.event_name.toLowerCase(),
                'recorded': true,
                'ranked': true
            }
        },
        {
            $group: {
                _id: '$slots.username',
                kills: { $sum: '$slots.kills' },
                deaths: { $sum: '$slots.deaths' },
                assists: { $sum: '$slots.assists' },
                points: { $sum: '$slots.points' },
                wins: { $sum: { $cond: ['$slots.win', 1, 0] } },
                games: { $sum: 1 }
            }
        }
    ]);
    for (var i = 0; i < games.length; i++) {
        var alias = await Alias.findOne({ alias: { $eq: games[i]._id } });
        if (alias) {
            games[i].alias = alias.username;
        } else {
            games[i].alias = games[i]._id;
        }
    }
    games.sort(function(a, b) {
        if (b['wins'] == a['wins']) {
            return b['points'] - a['points'];
        }
        return b['wins'] - a['wins'];
	}); 
    games = games.slice(0, 10);
    return res.json({ event: event, games: games });
});

module.exports = router;
