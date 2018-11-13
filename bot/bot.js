'use strict';

var Discord = require('discord.js');
var http = require('http');
var moment = require('moment');

// Initialize Discord Bot
var bot = new Discord.Client();

// commands  
var trivia = require('./commands/trivia')(bot);
var missionTopTitle = require('./commands/missiontoptitle');
var missionTopRank = require('./commands/missiontoprank');
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
var blockAlias = require('./commands/blockalias');
var unblockAlias = require('./commands/unblockalias');
var mergeAliases = require('./commands/mergealiases');
var deleteAlias = require('./commands/deletealias');
var getPlayerName = require('./commands/getplayername');
var hostGame = require('./commands/hostgame');
var displayScore = require('./commands/displayscore');
var displayRanking = require('./commands/displayranking');
var unrecordGame = require('./commands/unrecordgame');
var recordGame = require('./commands/recordgame');
var unrecordableGame = require('./commands/unrecordable');
var displayGames = require('./commands/displaygames');
var displayLastGames = require('./commands/displaylastgames');
var displayLastRecordedGames = require('./commands/displaylastrecordedgames');
var displayGameInfo = require('./commands/displaygameinfo');
var buy = require('./commands/buy');
var join = require('./commands/join'); 
var summon = require('./commands/summon');
var character = require('./commands/character');
var giveGold = require('./commands/givegold');
var setStatus = require('./commands/setstatus');
var balance = require('./commands/balance');
var displayMissions = require('./commands/missions');
var setColor = require('./commands/setcolor');
var displayHeroes = require('./commands/displayheroes');
var displayHero = require('./commands/displayhero');

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
		displayGames(ev, ev.progress ? inProgressGames_ : hostedGames_, true, ev.progress);
		if (!ev.progress) {
			for (var id in ev.endingGames) {
				var contains = false;
				for (var i = 0; i < inProgressGames_.length; i++) {
					if (inProgressGames_[i].id == id) {
						contains = true;
						break;
					}
				}
				if (!contains) {
					ev.endingGames[id].delete().then(function() {
						delete ev.endingGames[id];
					});
				}
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
					ev.onlineStreams[_id].message.delete().then(function() {
						if (ev.onlineStreams[_id].embed) {
							ev.onlineStreams[_id].embed.delete();
						}
						delete ev.onlineStreams[_id];
					});
				} 
			} 
			ev.count = ev.count || 0;
			ev.count += 1;
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
						if (ev.onlineStreams[stream._id].embed && (ev.count % 6 == 0))
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
		} else if (channel.name == 'games-in-progress') {
			channel.fetchMessages().then(function(messages) {
				var deleted = 0;
				var count = 0;
				messages.forEach(function(message) {
					if (message.author.id == bot.user.id) {
						++count;
						message.delete().then(function() {
							++deleted;
							if (deleted == count) {
								channel.send('Broadcasting in-progress games.').then(function(ev) {
									ev.progress = true; 
									broadcastings[channel] = ev;
								});
							}
						});
					}
				});
				if (count == 0) {
					channel.send('Broadcasting in-progress games.').then(function(ev) {
						ev.progress = true; 
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
				'< !help >          : Display this message\n' + 
				'< !gamecmds >      : Display game-related commands\n' + 
				'< !playercmds >    : Display player-related commands\n' + 
				'< !rpgcmds >       : Display RPG-related commands\n' + 
				'< !botcmds >       : Display bot-related commands\n' + 
				'< !admincmds >     : Admin only commands```' 
			);    
		} else if (cmd == 'gamecmds') {
			ev.channel.send(  
				'Game-related commands:\n```md\n' + 
				'< ![h]ost > [location] [owner] : Host a new game\n' + 
				'< !lobby >                     : List games in lobby\n' + 
				'< ![b]alance > [criteria]      : Display the optimal balance of games in lobby\n' + 
				'< ![p]rogress >                : List games in progress\n' + 
				'< ![l]ast >                    : Fetch last non-recorded played games\n' + 
				'< !recorded >                  : Fetch last recorded played games\n' + 
				'< ![i]nfo > <game_id>          : Fetch info about a played game\n' + 
				'< ![r]ecord > <game_id> <code> : Record a game\n' +  
				'< ![u]nrecordable > <game_id>  : Set a game to be unrecordable\n' +
				'< !heroes > [criteria]         : Display meta information about game heroes\n' + 
				'< !hero > <name>               : Display meta information about specific hero\n' + 
				'```' 
			);  
		} else if (cmd == 'playercmds') {
			ev.channel.send(  
				'Player-related commands:\n```md\n' + 
				'< !ra[n]king > [player_name] : Display player position in Ninpou ranking\n' + 
				'< ![s]core > [player_name]   : Display a player score in the ranking\n' + 
				'< !addalias > <player_name>  : Register a new alias\n' +  
				'< ![w]hois > <player_name>   : Check who in discord is using a determined account\n' + 
				'< !aliasof > <user>          : Display all alias from a user\n' + 
				'< !setcolor> <#code>         : Set your color (only for "Can\'t get enough" rank\n' + 
				'```'
			);  
		} else if (cmd == 'rpgcmds') {
			ev.channel.send(  
				'RPG-related commands:\n```md\n' + 
				'< ![m]issions >           : List available missions\n' + 
				'< ![g]et > [user]         : Display information about an user\n' + 
				'< !give > <user> <amount> : Give gold to an user\n' +   
				'< !items >                : Display items available to be purchased\n' + 
				'< !villages>              : Display villages available to join\n' + 
				'< !characters >           : Display characters available to buy\n' + 
				'< !summons >              : Display summons available to buy\n' + 
				'< !status > <status>      : Set a status\n' + 
				//'< !jutsus >            : Display jutsus available to be purchased\n' +
				'```'
			);  
		} else if (cmd == 'botcmds') {
			ev.channel.send(  
				'Bot-related commands:\n```md\n' + 
				'< !addstream > <channel>    : Add a new streaming channel\n' + 
				'< !removestream > <channel> : Remove a streaming channel\n' + 
				'< !streams >                : List streaming channels\n' + 
				'< !trivia naruto >          : Start a Naruto trivia (use < !trivia > again to disable it)\n' +
				'< !trivia ninpou >          : Start a Ninpou trivia (use < !trivia > again to disable it)\n' + 
				'```'
			);  
		} else if (cmd == 'admincmds' && ev && ev.guild) {
			ev.guild.fetchMember(ev.author.id).then(function(author) {
				var isAdmin = false;
				author.roles.forEach(function(role) {
					if (role.name.toLowerCase() == 'moderator') {
						isAdmin = true; 
					}
				});
				if (isAdmin) {
					ev.channel.send(  
						'Admin-related commands:\n```md\n' + 
						'< !a > addalias <user> <alias>              : Add an alias to a player\n' + 
						'< !a > removealias <user> <alias>           : Remove an alias from a player\n' + 
						'< !a > blockalias <alias>                   : Block an alias from being added to any account\n' + 
						'< !a > unblockalias <alias>                 : Unblock an alias```Super-admin commands:\n```md\n' +  
						'< !a > mergealiases <old_alias> <new_alias> : Merge two aliases (be careful: this cannot be undone)\n' + 
						'< !a > deletealias <alias>                  : Delete all stats from an alias (be careful: this cannot be undone)\n' + 
						'```'
					);   
				} else {
					ev.channel.send('Only admins can use this command! **Oink!**');
				}
			});
		} else if (cmd == 'a') {
			ev.guild.fetchMember(ev.author.id).then(function(author) {
				var isAdmin = false;
				var isSuperAdmin = false; 
				author.roles.forEach(function(role) {
					if (role.name.toLowerCase() == 'moderator') {
						isAdmin = true; 
					} else if (role.name.toLowerCase() == 'admin') {
						isSuperAdmin = true; 
					}
				});
				if (isAdmin) { 
					if (args[0] == 'addalias') {
						if (ev.mentions.users.array().length == 1) {
							addAlias(ev, args[2], ev.mentions.users.array()[0].id);
						} else {
							ev.channel.send('Me no understand! Use **!a addalias <user> <alias>**');
						}
					} else if (args[0] == 'removealias') {
						if (ev.mentions.users.array().length == 1) {
							removeAlias(ev, args[2], ev.mentions.users.array()[0].id);
						} else {
							ev.channel.send('Me no understand! Use **!a removealias <user> <alias>**');
						}
					} else if (args[0] == 'blockalias') {
						if (args.length == 2) {
							blockAlias(ev, args[1]);
						} else { 
							ev.channel.send('Me no understand! Use **!a blockalias <alias>');
						}
					} else if (args[0] == 'unblockalias') {
						if (args.length == 2) {
							unblockAlias(ev, args[1]);
						} else { 
							ev.channel.send('Me no understand! Use **!a unblockalias <alias>');
						}
					/*} else if (args[0] == 'unrecord') {
						if (args.length == 2) {
							unrecordGame(ev, args[1]);
						} else { 
							ev.channel.send('Me no understand! Use **!a unrecord <game_id>**');
						} */
					} else if (args[0] == 'mergealiases') {
						if (!isSuperAdmin) { 
							ev.channel.send('Only super-admins can use this command! **Oink!!**');
						} else if (args.length == 3) {
							mergeAliases(ev, args[1], args[2]);
						} else { 
							ev.channel.send('Me no understand! Use **!a mergealiases <old_alias> <new_alias>**');
						}
					} else if (args[0] == 'deletealias') {
						if (!isSuperAdmin) {
							ev.channel.send('Only super-admins can use this command! **Oink!!**');
						} else if (args.length == 2) {
							deleteAlias(ev, args[1]);
						} else { 
							ev.channel.send('Me no understand! Use **!a deletealias <alias>**');
						}
					} else {
						ev.channel.send('Admin command not found! **Oink!**');
					}
				} else {
					ev.channel.send('Only admins can use this command! **Oink!**');
				}
			});
		} else if (cmd == 'addalias') {
			getAliasOf(ev.author.id, function(err, alias) {
				if (alias.length > 0) {
					ev.channel.send('You can only have one alias per account now. If you want to add another alias, ask an admin! **Oink!!**');
				} else {
					if (args.length > 0) {
						addAlias(ev, args[0]);
					} else {
						ev.channel.send('Me no understand! Type **!addalias <account>**, replacing **<account>** by your Warcraft 3 account.');
					} 
				}
			});
		} else if (cmd == 'removealias') {
			/*if (args.length > 0) {
				removeAlias(ev, args[0]);
			} else {
				ev.channel.send('Me no understand! Use **!removealias <account>**');
			}*/
			ev.channel.send('Only admins can remove aliases now. Ask one! **Oink!!**');
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
							if (args[0] == 'titles') {
								var response = 	'```md\n[     -] [S-Rank] < !mission title-score >     : Be Top-1 on score ranking and get the "One above all" title\n' + 
												'[     -] [S-Rank] < !mission title-kills >     : Be Top-1 on kills ranking and get the "Solo killer" title\n\n' + 
												'[     -] [S-Rank] < !mission title-deaths >    : Be Top-1 on deaths ranking and get the "Untouchable" title\n\n' + 
												'[     -] [S-Rank] < !mission title-assists >   : Be Top-1 on assists ranking and get the "Guardian angel" title\n\n' + 
												'[     -] [S-Rank] < !mission title-points>     : Be Top-1 on points ranking and get the "Legend" title\n\n' + 
												'[     -] [S-Rank] < !mission title-gpm>        : Be Top-1 on gpm ranking and get the "Gold farmer" title\n\n' + 
												'[     -] [S-Rank] < !mission title-games>      : Be Top-1 on games ranking and get the "Can\'t get enough" title\n\n' + 
												'[     -] [S-Rank] < !mission title-chance>     : Be Top-1 on chance of winning ranking and get the "Champion" title```';
								ev.channel.send(response);
							} else if (args[0] == 'ranks') {
								var response = 	'```md\n' + 
												'[     -] [D-Rank] < !mission rank-chunnin >     : Play over <10> games, have more than <50> average points and play a balanced game today with >= <15> kills and <= <15> deaths\n\n' + 
												'[     -] [C-Rank] < !mission rank-tokubetsu >   : Play over <25> games, have more than <75> average points and play a balanced game today with >= <20> kills and <= <12> deaths\n\n' + 
												'[     -] [B-Rank] < !mission rank-jounin >      : Play over <35> games, have more than <100> average points and play a balanced game today with >= <25> kills and <= <10> deaths\n\n' + 
												'[     -] [A-Rank] < !mission rank-anbu >        : Play over <50> games, have more than <150> average points and play a balanced game today with >= <35> kills and <= <8> deaths\n\n' + 
												'[     -] [S-Rank] < !mission rank-kage>         : Be Top-1 on ranking of your village and get the Kage rank```';
								ev.channel.send(response);
							} else {
								displayMissions(ev);
							}
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
											if (ev.mentions.users.array()[0].id == ev.author.id) { 
												ev.channel.send('You can\'t rob yourself, silly! **Oink!!**');
											} else {
												missionRob(ev, ev.mentions.users.array()[0].id);
											}
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
										missionGame(ev, 'assists10');
										break;
									case 'dailies':
										missionGame(ev, 'dailies');
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
									case 'chunin':
									case 'chuunin':
									case 'chunnin':
									case 'rank-chuunin':
									case 'rank-chunin':
									case 'rank-chunnin':
										missionTopRank(ev, 'chunnin');
										break;
									case 'tokubetsu':
									case 'rank-tokubetsu':
										missionTopRank(ev, 'tokubetsu jōnin');
										break;
									case 'jonin':
									case 'jounin':
									case 'rank-jonin':
									case 'rank-jounin':
										missionTopRank(ev, 'jōnin');
										break;
									case 'anbu':
									case 'rank-anbu':
										missionTopRank(ev, 'anbu');
										break;
									case 'kage':
									case 'rank-kage':
										missionTopRank(ev, 'kage');
										break;
									default:
										ev.channel.send('Mission not found.');
										break;
								}
							} else { 
								ev.channel.send('Me no understand! Use **!mission <name>**');
							}
							break; 
						case 'summons':
							ev.channel.send('**Oink, oink**!\nHere are the summons you can buy\n' + 
							'```md\nUse !summon <id> to buy a summon\n' + 
							'[1] [Frog lvl. 1]     : Requires level 10, 100000g (Increase mission reward by 150%)\n' + 
							'[2] [Frog lvl. 2]     : Requires level 25, 1000000g (Increase mission reward by 250%)\n' + 
							'[3] [Frog lvl. 3]     : Requires level 50, 10000000g (Increase mission reward by 500%)\n' + 
							'[4] [Snake lvl. 1]    : Requires level 10, 100000g (Increase chance of gambling by 10%)\n' + 
							'[5] [Snake lvl. 2]    : Requires level 25, 1000000g  (Increase chance of gambling by 15%)\n' + 
							'[6] [Snake lvl. 3]    : Requires level 50, 10000000g (Increase chance of gambling by 25%)\n' +
							'[7] [Slug lvl. 1]     : Requires level 10, 100000g (Decrease mission requirement by 1)\n' + 
							'[8] [Slug lvl. 2]     : Requires level 50, 10000000g (Decrease mission requirement by 2)\n' + 
							'[9] [Hawk]            : Requires level 25, 1000000g (Increase rob chance by 10%)\n' + 
							'[10] [Crow]           : Requires level 25, 1000000g (Decrease chance of being robbed by 15%)\n' + 
							'[11] [Dog]            : Requires level 15, 150000g (10% chance to get 20x reward on missions)```');
							break;
						case 'summon':
							if (args.length == 1) {
								if (args[0] === '1') {
									summon(ev, 'frog1');
								} else if (args[0] === '2') {
									summon(ev, 'frog2');
								} else if (args[0] === '3') {
									summon(ev, 'frog3');
								} else if (args[0] === '4') {
									summon(ev, 'snake1');
								} else if (args[0] === '5') {
									summon(ev, 'snake2');
								} else if (args[0] === '6') {
									summon(ev, 'snake3');
								} else if (args[0] === '7') {
									summon(ev, 'slug1');
								} else if (args[0] === '8') {
									summon(ev, 'slug2');
								} else if (args[0] === '9') {
									summon(ev, 'hawk');
								} else if (args[0] === '10') {
									summon(ev, 'crow');
								} else if (args[0] == '11') {
									summon(ev, 'dog');
								} else {
									ev.channel.send('Summon not found. :( **Oink!**');
								}
							} else {
								ev.channel.send('Me no understand! Use **!summon <summon_id>**');
							}
							break;
						case 'villages':
							ev.channel.send('**Oink, oink**!\nHere are the villages you can join\n' + 
							'```\md\nUse !join <village> to join a village\n' + 
							'[Konohagakure]        : Requires level 1, 0g\n' + 
							'[Sunagakure]          : Requires level 5, 1000g\n' + 
							'[Kirigakure]          : Requires level 5, 1000g\n' + 
							'[Kumogakure]          : Requires level 5, 1000g\n' + 
							'[Iwagakure]           : Requires level 5, 1000g\n' +
							'[Otogakure]           : Requires level 15, 100000g\n' + 
							'[Akatsuki]            : Requires level 50, 10000000g```');
							break;
						case 'join':
							if (args.length == 1) {
								join(ev, args[0].toLowerCase());
							} else {
								ev.channel.send('Me no understand! Use **!join <village>**');
							}
							break;
						case 'characters':
							ev.channel.send('**Oink, oink**!\nHere are the available characters to buy\n' + 
							'```md\nUse !char <character> to buy a character\n' + 
							'[Naruto]             : -\n' + 
							'[Sasuke]             : -\n' + 
							'[Sakura]             : -\n' + 
							'[Gaara]              : -\n' + 
							'[Neji]               : Requires level 5, 10000g\n' + 
							'[Lee]                : Requires level 5, 10000g\n' + 
							'[Tenten]             : Requires level 5, 10000g\n' + 
							'[Shino]              : Requires level 5, 10000g\n' + 
							'[Hinata]             : Requires level 5, 10000g\n' + 
							'[Kiba]               : Requires level 5, 10000g\n' + 
							'[Ino]                : Requires level 5, 10000g\n' + 
							'[Shikamaru]          : Requires level 5, 10000g\n' + 
							'[Chouji]             : Requires level 5, 10000g\n' + 
							'[Tsunade]            : Requires level 20, 1000000g\n' + 
							'[Orochimaru]         : Requires level 20, 1000000g\n' + 
							'[Sasori]             : Requires level 25, 2000000g\n' + 
							'[Deidara]            : Requires level 25, 2000000g\n' + 
							'[Hidan]              : Requires level 25, 2000000g\n' + 
							'[Kakuzu]             : Requires level 25, 2000000g\n' + 
							'[Konan]              : Requires level 25, 2000000g\n' + 
							'[Kisame]             : Requires level 35, 5000000g\n' + 
							'[Kakashi]            : Requires level 35, 5000000g\n' + 
							'[Gai]                : Requires level 35, 5000000g\n' +
							'[Bee]                : Requires level 35, 5000000g\n' + 
							'[Tobirama]           : Requires level 50, 10000000g\n' + 
							'[Minato]             : Requires level 75, 100000000g\n' + 
							'[Itachi]             : Requires level 75, 100000000g\n' + 
							'[Nagato]             : Requires level 75, 100000000g\n' + 
							'[Obito]              : Requires level 75, 100000000g\n' + 
							'[Madara]             : Requires level 100, 1000000000g\n' + 
							'[Hashirama]          : Requires level 100, 1000000000g\n' +
							'[Kaguya]             : Requires level 150, 10000000000g```');
							break;
						case 'char':
							if (args.length == 1) {
								character(ev, args[0].toLowerCase());
							} else {
								ev.channel.send('Me no understand! Use **!char <character>**');
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
						case 't': 
							if (args.length > 0) {
								trivia.answer(ev.author, args.join(' ').toLowerCase(), ev);
							} else {
								ev.channel.send('Me no understand! Use **!t <answer>**');
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
						case 'u':
						case 'unrecordable':
							if (args.length == 1) {
								unrecordableGame(ev, args[0]);
							} else { 
								ev.channel.send('Me no understand! Use **!unrecordable <game_id>**');
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
						case 'heroes':
							if (args.length > 0) {
								displayHeroes(ev, args[0]);
							} else {
								displayHeroes(ev);
							}
							break; 
						case 'hero':
							if (args.length == 1) {
								displayHero(ev, args[0]);
							} else {
								ev.channel.send('Me no understand! Use **!hero <name>**');
							}
							break;
						case 'w':
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
						case 'setcolor':
							if (args.length == 1) {
								setColor(ev, args[0]);
							} else { 
								ev.channel.send('Me no understand! User **!setcolor <#code>**');
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
