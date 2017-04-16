'use strict';

var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var SteamStrategy = require('passport-steam').Strategy;
var LocalStrategy = require('passport-local').Strategy;

const steamKey = 'AC040EDC422800862F06B3659F1860FA';
const jwtSecretOrKey = '1R3@LlYL1k3C@k3';

passport.use('steam', new SteamStrategy({
		returnURL: 'https://narutoninpou.herokuapp.com/users/auth/steam/return',
		realm: 'https://narutoninpou.herokuapp.com',
		apiKey: steamKey,
		session: false
	},
	function(identifier, profile, done) {
		console.log(identifier);
		console.log(profile);	  
		/*User.findByOpenID({ openId: identifier }, function (err, user) {
			return done(err, user);
		});*/
		return done(null, { profile: profile, identifier: identifier });
	}
));

passport.use('local', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		session: false 
	},
	function(username, passport, done) {
		return done(null, { username: username });
	}
));

passport.use('jwt', new JwtStrategy({
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: jwtSecretOrKey
	}, function(payload, done) {
		console.log(payload);
		done(null, { username: payload.username });
	}
));

module.exports = {
	secretOrKey: jwtSecretOrKey,
	authenticate: function(strategy, params) {
		params = params || { };
		params.session = false;
		return passport.authenticate(strategy, params)
	},
	initialize: function() {
		return passport.initialize()
	}
};
