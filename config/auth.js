'use strict';

var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var SteamStrategy = require('passport-steam').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');

const steamKey = 'AC040EDC422800862F06B3659F1860FA';
const jwtSecretOrKey = '1R3@LlYL1k3C@k3';

passport.use('steam', new SteamStrategy({
		returnURL: 'https://narutoninpou.herokuapp.com/auth/steam/return',
		realm: 'https://narutoninpou.herokuapp.com',
		apiKey: steamKey,
		session: false
	},
	function(identifier, profile, done) {
		User.findOne({ openID: identifier }, function(err, user) {
			if (err) return done(err);
			else if (!user) {
				user = new User({
					provider: 'steam',
					openID: identifier
				});
			}
			user.displayName = profile._json.personaname;
			user.steamProfileUrl = profile._json.profileurl;
			user.countryCode = profile._json.loccountrycode;
			user.profilePhoto = profile._json.avatarfull;
			user.save(function(err) {
				if (err) return done(err, null);
				return done(null, user);
			});
		});
	}
));

passport.use('local', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		session: false 
	},
	function(username, passport, done) {
		User.find({}, function(err, users) {
			return done(null, users[0]);
		});
	}
));

passport.use('jwt', new JwtStrategy({
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: jwtSecretOrKey
	}, function(payload, done) {
		var openID = payload.openID;
		User.findOne({ openID: openID }, function(err, user) {
			if (err) return done(err);
			else if (!user) return done('User not found.');
			return done(null, user);
		});
	}
));

module.exports = {
	secretOrKey: jwtSecretOrKey,
	authenticate: function(strategy, params) {
		params = params || { };
		params.session = false;
		strategy = strategy || 'jwt';
		return passport.authenticate(strategy, params)
	},
	initialize: function() {
		return passport.initialize()
	}
};
