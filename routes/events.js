'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Event = require('../models/Event');
var Game = require('../models/Game');
var Alias = require('../models/Alias');
var Stat = require('../models/Stat');

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

router.use('/:event_name', function(req, res, next) {
    var event = await Event.findOne({ name: req.params.event_name.toLowerCase() });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    req.event = event;
	next();
});

async function getEventLeaderboard(req, res) {
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
    return games;
}

router.get('/:event_name', async function (req, res) {
    var games = await getEventLeaderboard(req, res);
    return res.json({ event: req.event, games: games });
});

router.post('/:event_name/close', async function (req, res) {
    req.event.closed = true;
    var games = await getEventLeaderboard(req, res);
    for (var i = 0; i < Math.min(3, games.length); i++) {
        var stats = await Stat.findOne({ username: games[i]._id });
        if (stats) {
            stats.awards = stats.awards || [];
            stats.awards.push({
                eventname: req.event.name,
                position: i
            });
            await stats.save();
        }
    }
    await req.event.save(); 
});

module.exports = router;
