'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Event = require('../models/Event');

router.post('/', async function (req, res) {
	try {
        var event = await Event.findOne({ name: req.body_event_name });
        if (event) return res.status(400).json({ error: 'Event already exists.' });
        event = new Event({
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
	var event = await Event.findOne({ name: req.params.event_name });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    return res.json(event);
});

module.exports = router;
