var express = require('express');

var app = express();
app.use(express.static('static'));

var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;

passport.use('steam', new SteamStrategy({
    returnURL: 'https://narutoninpou.herokuapp.com/auth/steam/return',
    realm: 'https://narutoninpou.herokuapp.com',
    apiKey: 'AC040EDC422800862F06B3659F1860FA'
  },
  function(identifier, profile, done) {
    /*User.findByOpenID({ openId: identifier }, function (err, user) {
      return done(err, user);
    });*/
	return done(null, { profile: profile, identifier: identifier });
  }
));

app.get('/auth/steam', passport.authenticate('steam'));

app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), function(req, res) {
	res.json(req.user);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log('Listening on port ' + port + '...');
});