'use strict';

var Discord = require('discord.js');
var http = require('http');
var moment = require('moment');

// Initialize Discord Bot
var bot = new Discord.Client();

// commands  
var trivia = require('./commands/trivia')(bot);
var missionTopTitle = require('./commands/missiontoptitle');
var missionTop = require('./commands/missiontop'); 
var missionGamble = require('./commands/missiongamble'); 
var missionRob = require('./commands/missionrob');
var missionGame = require('./commands/missiongame');
var missionRescue = require('./commands/missionrescue');
var listStreams = require('./commands/liststreams');
var removeStream = require('./commands/removestream');
var addStream = require('./commands/addstream');
var aliasOf = require('./commands/aliasof');
var getAliasOf = require('./commands/getaliasof');
var getInfo = require('./commands/getinfo');
var whoIs = require('./commands/whois');
var addAlias = require('./commands/addalias');
var removeAlias = require('./commands/removealias');
var getPlayerName = require('./commands/getplayername');
var hostGame = require('./commands/hostgame');
var displayScore = require('./commands/displayscore');
var displayRanking = require('./commands/displayranking');
var unrecordGame = require('./commands/unrecordgame');
var recordGame = require('./commands/recordgame');
var displayGames = require('./commands/displaygames');
var displayLastGames = require('./commands/displaylastgames');
var displayLastRecordedGames = require('./commands/displaylastrecordedgames');
var displayGameInfo = require('./commands/displaygameinfo');
var buy = require('./commands/buy');
var giveGold = require('./commands/givegold');
var setStatus = require('./commands/setstatus');
var balance = require('./commands/balance');
var displayMissions = require('./commands/missions');

var hostedGames = [];
var inProgressGames = [];
var onlineStreams = []; 

setInterval(function() {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games' }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) return;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var games = JSON.parse(body);
				hostedGames = [];
				for (var i = 0; i < games.length; i++) {
					if (games[i]) {
						hostedGames.push(games[i]);
					} else {
						console.log(games);
					}
				}
			} catch (err) {
				console.error(err);
			}
		});
	}).on('error', function(err) {
		
	});
}, 10000);

setInterval(function() {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games/progress' }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) return;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				var games = JSON.parse(body); 
				inProgressGames = [];
				for (var i = 0; i < games.length; i++) {
					if (games[i]) {
						inProgressGames.push(games[i]);
					} else {
						console.log(games);
					}
				}
			} catch (err) {
				console.error(err);
			}
		});
	}).on('error', function(err) {
		var statusCode = res.statusCode;
		if (statusCode != 200) return;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				onlineStreams = JSON.parse(body);
			} catch (err) {
				console.error(err);
			} 
		}); 
	});
}, 10000);

setInterval(function() { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/streams/live' }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) return;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try { 
				var streams = JSON.parse(body); 
				onlineStreams = [];
				for (var i = 0; i < streams.length; i++) {
					if (streams[i]) {
						onlineStreams.push(streams[i]);
					} else {
						console.log(streams);
					}
				} 
			} catch(err) {
				console.error(err);
			}
		}); 
	}).on('error', function(err) {
		console.error(err);
	});
}, 10000);

var previewCacheUrl = '?_=' + (new Date()).getTime();

setInterval(function() {
	previewCacheUrl = '?_=' + (new Date()).getTime();
}, 120000);

var broadcastings = [];
setInterval(function() {
	var hostedGames_ = hostedGames;
	var inProgressGames_ = inProgressGames;
	var onlineStreams_ = onlineStreams; 
	for (var channel in broadcastings) {
		var ev = broadcastings[channel];
		ev.endingGames = ev.endingGames || [];
		displayGames(ev, hostedGames_, true, false);
		for (var id in ev.endingGames) {
			var contains = false;
			for (var i = 0; i < inProgressGames_.length; i++) {
				if (inProgressGames_[i].id == id) {
					contains = true;
					break;
				}
			}
			if (!contains) {
				ev.endingGames[id].delete();
				delete ev.endingGames[id];
			}
		}
		for (var i = 0; i < inProgressGames_.length; i++) {
			(function(game) {
				if (game.progress) {
					var duration = parseInt(game.duration.split(':')[1]);
					if (duration >= 40) { 
						var msg = '@here ' + game.gamename + ' is about to end (' + duration + ' minutes elapsed).';
						if (ev.endingGames.hasOwnProperty(game.id)) {
							ev.endingGames[game.id].edit(msg);
						} else {
							ev.channel.send(msg).then(function(message) {
								ev.endingGames[game.id] = message;
							});
						}
					}
				} 
			})(inProgressGames_[i]);
		}
		ev.onlineStreams = ev.onlineStreams || { };
		for (var _id in ev.onlineStreams) {
			var contains = false;
			for (var i = 0; i < onlineStreams_.length; i++) {
				if (onlineStreams_[i].stream._id == _id) {
					contains = true;
					break;
				}
			}
			if (!contains) {
				ev.onlineStreams[_id].message.delete();
				if (ev.onlineStreams[_id].embed)
					ev.onlineStreams[_id].embed.delete();
				delete ev.onlineStreams[_id];
			} 
		} 
		for (var i = 0; i < onlineStreams_.length; i++) {
			(function(stream) {
				var stream = stream.stream; 
				var date = new Date(stream.created_at);
				var m = moment(date);    
				var msg = '@here **' + stream.channel.display_name + '** is online. Watch it now: <' + stream.channel.url + '>.';
				var msgEmbed = new Discord.RichEmbed()
						.setTitle('Playing ' + stream.game)
						.setAuthor(stream.channel.name)  
						.setDescription(stream.channel.status)
						.setImage(stream.preview.large + previewCacheUrl)
						.setURL(stream.channel.url)
						.setThumbnail(stream.channel.logo)
						.setFooter(stream.viewers + ' viewers | Started '  + m.fromNow());
				if (ev.onlineStreams.hasOwnProperty(stream._id)) {
					if (ev.onlineStreams[stream._id].embed)
						ev.onlineStreams[stream._id].embed.edit(msgEmbed);
				} else {  
					ev.channel.send(msg).then(function(msg) {
						ev.onlineStreams[stream._id] = { message: msg };
						ev.channel.send(msgEmbed).then(function(msg) {
							ev.onlineStreams[stream._id].embed = msg;
						}); 
					}); 
				}
			})(onlineStreams_[i]);
		} 
	} 
}, 10000);

bot.on('ready', function (evt) {
	console.error('Logged in as: ' + bot.user.tag);
	bot.channels.forEach(function(channel) {
		if (channel.name == 'games-hosted') {
			channel.fetchMessages().then(function(messages) {
				var deleted = 0;
				var count = 0;
				messages.forEach(function(message) {
					if (message.author.id == bot.user.id) {
						++count;
						message.delete().then(function() {
							++deleted;
							if (deleted == count) {
								channel.send('Broadcasting hosted games.').then(function(ev) {
									broadcastings[channel] = ev;
								});
							}
						});
					}
				});
				if (count == 0) {
					channel.send('Broadcasting hosted games.').then(function(ev) {
						broadcastings[channel] = ev;
					});
				}
			});
		}
	});

});
bot.on('message', function(ev) {
	var message = ev.content;
	
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0].toLowerCase();
        args = args.splice(1);
        
        if (cmd == 'help') {
			ev.channel.send( 
				'**Oink, oink**!\nMe can do a lot of things. Check it:\n```md\n' + 
				'< !help >                       : Display this message\n' + 
				'< ![h]ost > [location] [owner]  : Host a new game\n' + 
				'< !lobby >                      : List games in lobby\n' + 
				'< ![b]alance > [criteria]       : Display the optimal balance of games in lobby\n' + 
				'< ![p]rogress >                 : List games in progress\n' + 
				'< ![l]ast >                     : Fetch last non-recorded played games\n' + 
				'< !recorded >                   : Fetch last recorded played games\n' + 
				'< ![i]nfo > <game_id>           : Fetch info about a played game\n' + 
				'< ![r]ecord > <game_id> <code>  : Record a game\n' +  
				'< !unrecord > <game_id>         : Unrecord a game\n' +  
				'< !ra[n]king > [player_name]    : Display player position in Ninpou ranking\n' + 
				'< ![s]core > [player_name]      : Display a player score in the ranking\n' + 
				'< !addalias > <player_name>     : Add a new alias\n' + 
				'< !removealias > <player_name>  : Remove an alias\n' + 
				'< !whois > <player_name>        : Check who in discord is using a determined account\n' + 
				'< !aliasof > <user>             : Display all alias from a user\n' + 
				'< !addstream > <channel>        : Add a new streaming channel\n' + 
				'< !removestream > <channel>     : Remove a streaming channel\n' + 
				'< !streams >                    : List streaming channels\n' +  
				'< ![m]issions >                 : List available missions\n' + 
				'< ![g]et > [user]               : Display information about an user\n' + 
				'< !give > <user> <amount>       : Give gold to an user\n' +   
				//'< !give > <user> <amount>     : Give certain amount of gold to some user\n' +   
				'< !items >                      : Display items available to be purchased\n' + 
				'< !status > <status>            : Set a status\n' + 
				//'< !jutsus >                   : Display jutsus available to be purchased\n' +
				'< !trivia naruto >              : Start a Naruto trivia (use < !trivia > again to disable it)\n' +
				'< !trivia ninpou >              : Start a Ninpou trivia (use < !trivia > again to disable it)```'
			);    
		} else if (cmd == 'addalias') {
			if (args.length > 0) {
				addAlias(ev, args[0]);
			} else {
				ev.channel.send('Me no understand! Use **!addalias <account>**');
			} 
		} else if (cmd == 'removealias') {
			if (args.length > 0) {
				removeAlias(ev, args[0]);
			} else {
				ev.channel.send('Me no understand! Use **!removealias <account>**');
			} 
		} else {
			getAliasOf(ev.author.id, function(err, alias) {
				if (err) {
					ev.channel.send('Bot is down. :( #bacon');
				} else if (!alias || alias.length == 0) {
					ev.channel.send('To use any command from this bot, you must first link your **Warcraft 3 account** using **!addalias** command.');
				} else {
					alias.push(ev.author.id);
					switch(cmd) {
						// !missions  
						case 'missions': 
							displayMissions(ev);
							break; 
						case 'm':
						case 'mission':
							if (args.length > 0) {
								switch (args[0]) {
									case 'rescue':
										missionRescue(ev);
										break;
									case 'gamble':
										if (args.length == 2) {
											missionGamble(ev, args[1]);
										} else {
											ev.channel.send('Me no understand! Use **!mission gamble <amount>**');
										}
										break;
									case 'rob':
										if (ev.mentions.users.array().length == 1) {
											missionRob(ev, ev.mentions.users.array()[0].id);
										} else {
											ev.channel.send('Me no understand! Use **!mission rob <user>**');
										}
										break;
									case 'play':
										missionGame(ev, 'play');
										break;
									case 'win':
										missionGame(ev, 'win');
										break; 
									case 'farm':
										missionGame(ev, 'farm3k');
										break;
									case 'assassin':
										missionGame(ev, 'kills20');
										break;
									case 'untouchable':
										missionGame(ev, 'deaths5');
										break;
									case 'angel':
										missionGame(ev, 'assists15');
										break;
									case 'top':
										missionTop(ev);
										break; 
									case 'title-score':
										missionTopTitle(ev, 'score');
										break;
									case 'title-kills':
										missionTopTitle(ev, 'kills');
										break;
									case 'title-deaths':
										missionTopTitle(ev, 'deaths');
										break;
									case 'title-assists':
										missionTopTitle(ev, 'assists');
										break;
									case 'title-points':
										missionTopTitle(ev, 'points');
										break;
									case 'title-gpm':
										missionTopTitle(ev, 'gpm');
										break;
									case 'title-games':
										missionTopTitle(ev, 'games');
										break;
									case 'title-chance':
										missionTopTitle(ev, 'chance');
										break; 
									default:
										ev.channel.send('Mission not found.');
										break;
								}
							} else { 
								ev.channel.send('Me no understand! Use **!mission <name>**');
							}
							break; 
						// !shop 
						case 'items':
							ev.channel.send('**Oink, oink**!\nWelcome to my marvelous shop. Find all sort of ninja tools here!\n' +
							'```md\nUse !buy <id> to buy an item\n' +
								'< WEAPONS >\n' + 
								'[ 1] [    100g] [Old Kunai]                 : +10 attack\n' + 
								'[ 2] [   1000g] [Sharp Kunai]               : +50 attack\n' + 
								'[ 3] [   5000g] [Steel Kunai]               : +100 attack\n' + 
								'[ 4] [  10000g] [Chakra Enhanced Kunai]     : +500 attack\n' + 
								'[ 5] [  50000g] [Chakra Blades]             : +1000 attack, 10% critical strike\n' + 
								'[ 6] [ 100000g] [Executioner\'s Blade]       : +5000 attack, 25% critical strike\n' + 
								'[ 7] [ 500000g] [Samehada Sword]            : +10000 attack, 25% critical strike, 10% chakra drain\n' + 
								'[ 8] [1000000g] [Totsuka Sword]             : +50000 attack, 50% critical strike, 20% seal enemy\n' + 
								'[ 9] [5000000g] [Heaven Sword]              : +100000 attack, 75% critical strike, 10% kill instantly\n' + 
								'< CLOTHES >\n' + 
								'[10] [    100g] [Academy Student Cloth]     : +10 armor\n' + 
								'[11] [   1000g] [Genin Cloth]               : +50 armor\n' + 
								'[12] [   5000g] [Veteran Genin Cloth]       : +100 armor\n' + 
								'[13] [  10000g] [Chunnin Cloth]             : +300 armor\n' + 
								'[14] [  50000g] [Veteran Chunnin Cloth]     : +500 armor\n' + 
								'[15] [ 100000g] [Jounin Cloth]              : +1000 armor\n' + 
								'[16] [ 500000g] [ANBU Cloth]                : +5000 armor\n' + 
								'[17] [1000000g] [Kage Cloth]                : +10000 armor\n' + 
								'< ACCESSORIES >\n' + 
								'[18] [   1000g] [Genin Forehead]            : +100 hp\n' + 
								'[19] [   5000g] [Reinforced Genin Forehead] : +500 hp\n' + 
								'[20] [  10000g] [Shinigami Mask]            : +1000 hp\n' + 
								'[21] [  50000g] [Akatsuki Ring]             : +5000 hp\n' + 
								'[22] [ 100000g] [Rikuudou Necklace]         : +10000 hp```');
							break;
						// !buy 
						case 'buy':
							if (args.length == 1) {
								buy(ev, args[0]); 
							} else {
								ev.channel.send('Me no understand! Use **!buy <item_id>**');
							}
							break;
						// !jutsus
						case 'jutsus':  
							ev.channel.send(
								'**Oink, oink**!\nWelcome to the Ninja Academy. Learn all sort of jutsus here!\n```md\n' + 
								'Use !learn <id> to learn a jutsu. You can gain xp completing missions.\n' + 
								'[1] [                  -] Katon: Goukakyuu no Jutsu   : Deals 10 x level katon damage (5 turns cooldown)\n' + 
								'[2] [                  -] Suirou no Jutsu             : Deals 2 x level suiton damage and binds enemy for one turn (5 turns cooldown)\n' + 
								'[3] [                  -] Fuuton Shuriken             : Deals 7 x level fuuton damage with 25% chance to deal critical strike (5 turns cooldown)\n' + 
								'[4] [                  -] Doton: Doryuu Taiga         : Deals 5 x level doton damage with 50% chance to bind enemy for one turn (5 turns cooldown)\n' + 
								'[5] [                  -] Raikyuu                     : Deals 10 x level raiton damage (5 turns cooldown)\n' +
								'[6] [    Suirou no Jutsu] Suiton: Suijinheki          : Deals 20 x level suiton damage and turns user invulnerable for one turn (5 turns cooldown)\n' + 
								'[7] [Doton: Doryuu Taiga] Doton: Dorou Domu           : Turns user invulnerable for one turn and has 50% chance to bind enemy for one turn (5 turns cooldown)```' 
							);
							break;
						// !trivia
						case 'trivia':
							if (args.length > 0) {
								if (args[0] == 'naruto' || args[0] == 'ninpou') {
									trivia.start(args[0], ev);
								}
							} else {
								trivia.stop(ev);
							}
							break;
						// !a
						case 'a': 
							if (args.length > 0) {
								trivia.answer(ev.author, args.join(' ').toLowerCase(), ev);
							} else {
								ev.channel.send('Me no understand! Use **!a <answer>**');
							}
							break;
						case 'h':
						case 'host':
							if (args.length == 2) {
								var realm = args[0].toLowerCase();
								if (realm != 'atlanta' && realm != 'ny' && realm != 'la' && realm != 'europe' && realm != 'au' && realm != 'jp' && realm != 'sg') {
									ev.channel.send('Invalid location. Valid locations: **atlanta** (Atlanta, U.S. East), **ny** (New York, U.S. East), **la** (Los Angeles, U.S. West), **europe** (Germany), **au** (Australia), **jp** (Japan) and **sg** (Singapore)');
								} else { 
									hostGame(ev, args[1], args[0]);
								}
							} else if (args.length == 1) {
								var realm = args[0].toLowerCase();
								if (realm != 'atlanta' && realm != 'ny' && realm != 'la' && realm != 'europe' && realm != 'au' && realm != 'jp' && realm != 'sg') {
									ev.channel.send('Invalid location. Valid locations: **atlanta** (Atlanta, U.S. East), **ny** (New York, U.S. East), **la** (Los Angeles, U.S. West), **europe** (Germany), **au** (Australia), **jp** (Japan) and **sg** (Singapore)');
								} else { 
									hostGame(ev, alias[0], args[0]);
								}
							} else if (args.length == 0) {
								hostGame(ev, alias[0], 'atlanta');
							} else {
								ev.channel.send('Me no understand! Use **!host <location> <owner>**');
							}
							break;
						case 'lobby':
							displayGames(ev, hostedGames, false, false);
							break; 
						case 'p':
						case 'progress':
							displayGames(ev, inProgressGames, false, true);
							break; 
						case 'l':
						case 'last':
							displayLastGames(ev);
							break;
						case 'recorded':
							displayLastRecordedGames(ev);
							break;
						case 'i':
						case 'info': 
							if (args.length == 1) {
								displayGameInfo(ev, args[0]);
							} else {
								ev.channel.send('Me no understand! Use **!info <game_id>**');
							}
							break;
						case 'b':
						case 'balance': 
							if (args.length == 1) {
								var criteria = args[0];
								if (criteria == 'points' || criteria == 'kills' || criteria == 'assists' || criteria == 'gpm' || criteria == 'wins' || criteria == 'chance' || criteria == 'score') {
									balance(ev, hostedGames, criteria);
								} else {
									ev.channel.send('Invalid criteria. Available criterias: points, kills, assists, gpm, wins, chance, score.');
								}
							} else if (args.length == 0) {
								balance(ev, hostedGames, 'points');
							} else {
								ev.channel.send('Me no understand! Use **!balance <criteria>**');
							}
							break;
						case 'r':
						case 'record':
							if (args.length == 2) {
								recordGame(ev, args[0], args[1], alias);
							} else {
								ev.channel.send('Me no understand! Use **!record <game_id> <code>**');
							}
							break;
						case 'unrecord':
							if (args.length == 1) { 
								unrecordGame(ev, args[0], alias);
							} else {
								ev.channel.send('Me no understand! Use **!unrecord <game_id>**');
							}
							break;
						case 'n':
						case 'rank':
						case 'ranking': 
							if (args.length == 3) {
								if (ev.mentions.users.array().length > 0) {
									displayRanking(ev, ev.mentions.users.array()[0].id, args[1], args[2]);
								} else {  
									displayRanking(ev, args[0], args[1], args[2]);
								}
							} else if (args.length == 2) { 
								if (ev.mentions.users.array().length > 0) { 
									displayRanking(ev, ev.mentions.users.array()[0].id, args[1], '');
								} else {  
									if (args[1] == 'desc' || args[1] == 'asc') {
										displayRanking(ev, null, args[0], args[1]);
									} else {
										displayRanking(ev, args[0], args[1], '');
									}
								} 
							} else if (args.length == 1) {
								if (ev.mentions.users.array().length > 0) {
									displayRanking(ev, ev.mentions.users.array()[0].id, 'score', '');
								} else {  
									if (args[0] == 'score' || args[0] == 'kills' || args[0] == 'deaths' || args[0] == 'assists' || args[0] == 'gpm' || args[0] == 'wins' || args[0] == 'games' || args[0] == 'points' || args[0] == 'chance') {
										displayRanking(ev, null, args[0], '');
									} else if (args[0] == 'desc' || args[0] == 'asc') {
										displayRanking(ev, null, 'score', args[0]);
									} else {
										displayRanking(ev, args[0], 'score');
									}
								}
							} else { 
								displayRanking(ev, null, 'score');
							} 
							break;
						case 's':
						case 'score':
							if (args.length > 0) {
								if (ev.mentions.users.array().length > 0) {
									displayScore(ev, ev.mentions.users.array()[0].id);
								} else {
									displayScore(ev, args[0]);
								} 
							} else {
								displayScore(ev, ev.author.id);
							}
							break;
						case 'whois': 
							if (args.length == 1) {
								whoIs(ev, args[0]);
							} else {
								ev.channel.send('Me no understand! Use **!whois <player>**');
							}
							break;
						case 'aliasof': 
							if (args.length > 0 && ev.mentions.users.array().length > 0) {
								aliasOf(ev, ev.mentions.users.array()[0].id);
							} else { 
								ev.channel.send('Me no understand! Use **!aliasof <user>**');
							}
							break;
						case 'status':
							if (args.length > 0) { 
								setStatus(ev, args.join(' '));
							} else {
								ev.channel.send('Me no understand! Use **!status <status>**');
							}
							break;
						case 'g':
						case 'get':  
							if (args.length > 0 && ev.mentions.users.array().length > 0) {
								getInfo(ev, ev.mentions.users.array()[0].id);
							} else { 
								getInfo(ev, ev.author.id);
							}
							break; 
						case 'give':
							if (args.length == 2 && ev.mentions.users.array().length > 0) {
								giveGold(ev, ev.mentions.users.array()[0].id, args[1]);
							} else {
								ev.channel.send('Me no understand! Use **!give <user> <amount>**');
							}
							break;
						case 'addstream':
							if (args.length == 1) {
								addStream(ev, args[0]);
							} else {
								ev.channel.send('Me no understand! Use **!addstream <channel>**');
							}
							break;
						case 'removestream':
							if (args.length == 1) {
								removeStream(ev, args[0]);
							} else {
								ev.channel.send('Me no understand! Use **!removestream <channel>**');
							}
							break;
						case 'streams':
							listStreams(ev);
							break;
						case 'broadcast':
							if (broadcastings.hasOwnProperty(ev.channel)) { 
								delete broadcastings[ev.channel];
								ev.channel.send('Broadcasting disabled.');
							} else {
								broadcastings[ev.channel] = ev;
								ev.channel.send('Broadcasting hosted games. (Use again to disable it)');
							}
							break;
						case 'attack':
							var insults = ['noob', 'team stacker', 'feeder', 'leaver', 'rage-quitter', 'shithead', 'idiot', 'camper', 'Tobias\' cuck', 'so bad in Ninpou that I\'m pity', 'feeder as Madara', 'feeder as Minato', 'noob who doesn\'t know for what Smoke Bomb is for', 'noob who doesn\'t the price of Oil', 'hentai lover', 'worse than Fexter', 'guy who lost 1v1 to Fexter', 'teenage with a girl\'s voice', 'coward who can\'t win 1v1', 'fool', 'guy who keeps dildos', 'vegan', 'Fexter', 'Tobias'];
							ev.channel.send('*attacks ' + args[0] + ' and says: ' + args[0] + ' is a ' + insults[Math.floor(Math.random() * insults.length)] + '.* **Oink!**');
							break;
					 }
				}
			});
		}
     }
});

bot.login(process.env.BOT_TOKEN); 
