'use strict';

var version = require('../version').version;

var Discord = require('discord.js');
var http = require('http');
var https = require('https');
var moment = require('moment');

// Initialize Discord Bot
var bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

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
var displayScore = require('./commands/displayscore');
var displayRanking = require('./commands/displayranking');
var recordGame = require('./commands/recordgame');
var recordRankedGame = require('./commands/recordrankedgame');
var recordRankedGameApprove = require('./commands/recordrankedgameapprove');
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
var displayCharacters = require('./commands/displaycharacters');
var subscribe = require('./commands/subscribe');
var inviteMessageToPlayers = require('./commands/sendgamealert');
var inviteMessageToHost = require('./commands/sendgamealerthost');
var syncRank = require('./commands/syncrank');
var tipsShow = require('./commands/tipsShow');
var tipCreate = require('./commands/tipCreate');
var heroExists = require('./commands/heroExists');

var hostedGamesWC3 = [];
var hostedGamesWC3Messages = {};
var onlineStreams = [];
var onlineStreamsMessages = {};
var countUpdates = 0;

setInterval(function() {
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/games?_=' + (new Date()).getTime() }, function(res) {
		var statusCode = res.statusCode;
		if (statusCode != 200) return;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', function() {
			try {
				hostedGamesWC3 = JSON.parse(body);
			} catch (err) {
				console.error(err);
			}
		});
	}).on('error', function(err) {
		
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
						//console.log(streams);
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
	for (var channelname in broadcastings) {
		var channel = broadcastings[channelname];
		if (!onlineStreamsMessages.hasOwnProperty(channelname)) {
			onlineStreamsMessages[channelname] = {};
		}
		// remove offline streams 
		for (var _id in onlineStreamsMessages[channelname]) {
			var contains = false;
			for (var i = 0; i < onlineStreams.length; i++) {
				if (onlineStreams[i].stream._id === _id) {
					contains = true;
					break;
				}
			}
			if (!contains && onlineStreamsMessages[channelname][_id].hasOwnProperty('embed')) {
				onlineStreamsMessages[channelname][_id].embed.delete();
				onlineStreamsMessages[channelname][_id].embed = null;
				delete onlineStreamsMessages[channelname][_id];
			} 
		}
		// create or edit messages for online streams 
		for (var i = 0; i < onlineStreams.length; i++) {
			(function(stream) {
				var stream = stream.stream; 
				var date = new Date(stream.created_at);
				var m = moment(date);    
				var msg = '@here **' + stream.channel.display_name + '** is online. Watch it now: <' + stream.channel.url + '>.';
				var msgEmbed = new Discord.MessageEmbed()
						.setTitle('Playing ' + stream.game)
						.setAuthor(stream.channelname)  
						.setDescription(stream.channel.status)
						.setImage(stream.preview.large + previewCacheUrl)
						.setURL(stream.channel.url)
						.setThumbnail(stream.channel.logo)
						.setFooter(stream.viewers + ' viewers | Started '  + m.fromNow());
				if (onlineStreamsMessages[channelname].hasOwnProperty(stream._id)) {
					if (onlineStreamsMessages[channelname][stream._id].embed && (countUpdates % 6 == 0)) {
						onlineStreamsMessages[channelname][stream._id].embed.edit(msgEmbed);
					}
				} else {  
					onlineStreamsMessages[channelname][stream._id] = { };
					channel.channel.send(msgEmbed).then(function(msg) {
						onlineStreamsMessages[channelname][stream._id].embed = msg;
					}); 
				}
			})(onlineStreams[i]);
		}
		// remove non-existing games 
		if (!hostedGamesWC3Messages.hasOwnProperty(channelname)) {
			hostedGamesWC3Messages[channelname] = {};
		}
		// remove non existing games  
		for (var id in hostedGamesWC3Messages[channelname]) {
			var contains = false;
			for (var i = 0; i < hostedGamesWC3.length; i++) {
				if (hostedGamesWC3[i].id === id) {
					contains = true;
					break;
				}
			}
			if (!contains && hostedGamesWC3Messages[channelname][id].hasOwnProperty('msg')) {
				hostedGamesWC3Messages[channelname][id].msg.delete();
				hostedGamesWC3Messages[channelname][id].msg = null;
				delete hostedGamesWC3Messages[channelname][id];
			} 
		}
		// create or edit games  
		for (var i = 0; i < hostedGamesWC3.length; i++) {
			(function(game) {
				var msg = '@here ' + game.name + ' (' + game.playersa + '/' + game.playersb + ') on realm ' + game.realm;
				if (hostedGamesWC3Messages[channelname].hasOwnProperty(game.id)) {
					if (hostedGamesWC3Messages[channelname][game.id].msg) {
						hostedGamesWC3Messages[channelname][game.id].msg.edit(msg);
					}
				} else {  
					hostedGamesWC3Messages[channelname][game.id] = { };
					channel.channel.send(msg).then(function(msg) {
						hostedGamesWC3Messages[channelname][game.id].msg = msg;
					}); 
				}
			})(hostedGamesWC3[i]);
		}
	}
	++countUpdates;
}, 10000);

function completeAllMissions(ev) {
	missionRescue(ev, 'Rescue', function() {
		missionGame(ev, 'play', 'Play', function() {
			missionGame(ev, 'win', 'Win', function() {
				missionGame(ev, 'farm3k', 'Farm', function() {
					missionGame(ev, 'kills20', 'Assassin', function() {
						missionGame(ev, 'deaths5', 'Untouchable', function() {
							missionGame(ev, 'assists10', 'Angel', function() {
								missionGame(ev, 'dailies', 'Dailies', function() {
									ev.channel.send('Done.');
								});
							});
						});
					});
				});
			});
		});
	});
}

bot.on('ready', async function (evt) {
	console.error('Logged in as: ' + bot.user.tag);
	var channel = await bot.channels.fetch('356042944173834242');
	channel.send('Broadcasting hosted games on battle.net.\nVia: http://wc3maps.com');
});

bot.on('messageReactionAdd', async function(ev, user) {
	if (ev.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await ev.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
	
	var channelId = ev.message.channel.id;
	var bugReportingId = '692551415394205746';
	var balanceIssueId = '692551380786872352';
	var mapIdeaId = '692551338743037952';
	var musicIdeaId = '693108450749841478';
	var rankedGames = '692560325584748616';
	if (channelId == rankedGames) {
		var gameId = ev.message.content.split('\n')[0].split('`')[1];
		var channel = await bot.channels.fetch(rankedGames);
		if (ev.emoji.name == '👍') {
			recordRankedGameApprove(ev, gameId, function(err, message) {
				if (err) {
					console.log(err);
					channel.send(err);
				} else {
					channel.send('<@' + ev.message.mentions.users.array()[0] + '> Game `' + gameId + '` was ✅ approved as a ranked game.\n\n' + message);
				}
			});
		} else if (ev.emoji.name == '👎') {
			channel.send('<@' + ev.message.mentions.users.array()[0] + '> Game `' + gameId + '` was ❌ rejected as a ranked game.');
		}
	} else if (channelId == bugReportingId || channelId == balanceIssueId || channelId == mapIdeaId || channelId == musicIdeaId) {
		if (ev.emoji.name == '❌' || ev.emoji.name == '⭐' || ev.emoji.name == '✅') {
			var content = ev.message.content.split('\n');
			content.pop();
			content = content.join('\n');
			var targetChannel;
			if (ev.emoji.name == '❌') {
				targetChannel = '693442144475545631';
			} else {
				targetChannel = '693442059578638418';
			}
			ev.message.delete().then(async function() {
				var countUp = 0;
				var countDown = 0;
				ev.message.reactions.cache.forEach(function(reaction) {
					if (reaction.emoji.name == '👍') {
						countUp = reaction.count;
					} else if (reaction.emoji.name == '👎') {
						countDown = reaction.count;
					}
				});
				var channel = await bot.channels.fetch(targetChannel);
				var type; 
				if (channelId == bugReportingId) {
					type = '🐛 bug';
				} else if (channelId == balanceIssueId) {
					type = '❗ balance issue';
				} else if (channelId == mapIdeaId) {
					type = '🧠 map idea';
				} else if (channelId == musicIdeaId) {
					type = '🎵 music idea';
				}
				if (ev.emoji.name == '❌') {
					var message = 'The following **' + type + '** was **❌ rejected** with ' +  countUp + ' 👍 / ' + countDown + ' 👎 (to be approved you need at least 70% of approval):\n\n ' + content;
				} else {
					var message = 'The following **' + type + '** was **✅ approved** to be released on version **' + version + '** with ' + countUp + '👍 / ' + countDown + '👎:\n\n ' + content;
				}
				channel.send(message);
			});
		}
	}
}); 

bot.on('message', async function(ev) {
	var message = ev.content;

	if (ev.attachments) {
		ev.attachments.forEach(function(attachment) {
			if (attachment.name.startsWith('record_') && attachment.name.endsWith('.txt')) {
				var url = attachment.url;
				https.get(url, function(res) {
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('end', function() {
						body = body.split("Your code is:")[1].split("\" )")[0].replace(/\n/g, '').replace(/\r/g, '').trim();
						recordGame(ev, encodeURIComponent(body));
					});
				}).on('error', function(err) {
					console.error(err);
				});
			}
		});
	}
	
	
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
				//'< ![h]ost > [location] [owner]  : Host a new game (on ENTConnect)\n' + 
				//'< !lobby >                     : List games in lobby (on ENTConnect)\n' + 
				'< ![o]ptimal > < name_of_players>: Display the optimal balance of a game composed by given player names\n' + 
				//'< ![p]rogress >                : List games in progress (on ENTConnect)\n' + 
				//'< ![l]ast >                    : Fetch last non-recorded played games (on ENTConnect)\n' + 
				'< !recorded > [page]            : Fetch last recorded played games\n' + 
				'< ![i]nfo > <game_id>           : Fetch info about a played game\n' + 
				'< ![r]ecord > <code>            : Record a game\n' +  
				'< !ra[n]k > <game_id>           : Make a recorded game ranked so it will impact on players\' score\n' +
				//'< ![u]nrecordable > <game_id>  : Set a game to be unrecordable\n' +
				'< !heroes > [criteria]          : Display meta information about game heroes\n' + 
				'< !hero > <name>                : Display meta information about specific hero\n' + 
				//'< !tips > <hero_name>           : Show all tips related to a hero\n' +
				//'< !tip > <hero_name> <tip>      : Create a tip for a hero and get gold proportional to your rank (<25/50/100/200/400/800> x lvl)!\n' +
				//'< !subscribe >                  : Turn on/off Tonton private alert messages\n' +
				'```' 
			);  
		} else if (cmd == 'playercmds') {
			ev.channel.send(  
				'Player-related commands:\n```md\n' + 
				'< !ra[n]k > [player_name]             : Display player position in Ninpou ranking\n' + 
				'< ![s]core > [player_name]            : Display a player score in the ranking\n' + 
				'< ![h]i[s]tory > [player_name] [hero] : Display the history of a player\n' + 
				'< !addalias > <player_name>           : Register a new alias\n' +  
				'< ![w]hois > <player_name>            : Check who in discord is using a determined account\n' + 
				'< !aliasof > <user>                   : Display all alias from a user\n' + 
				'< !setcolor> <#code>                  : Set your color (only for "Can\'t get enough" rank\n' + 
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
				'< !bug > <description>          : Report a bug on #bug-reports\n' + 
				'< !balance > <description>      : Report a balance issue on #balance-issues\n' +
				'< !idea > <description>         : Post a map idea on #map-ideas\n' +
				'< !poll > <description>         : Create a new poll on #general-polls\n' +
				'< !addstream > <channel>    : Add a new streaming channel\n' + 
				'< !removestream > <channel> : Remove a streaming channel\n' + 
				'< !streams >                : List streaming channels\n' + 
				'< !trivia naruto >          : Start a Naruto trivia (use < !trivia > again to disable it)\n' +
				'< !trivia ninpou >          : Start a Ninpou trivia (use < !trivia > again to disable it)\n' + 
				'```'
			);  
		} else if (cmd == 'admincmds' && ev && ev.guild) {
			ev.guild.members.fetch(ev.author.id).then(function(author) {
				var isAdmin = false;
				author.roles.cache.forEach(function(role) {
					if (role == '340206323708985345') {
						isAdmin = true; 
					}
				});
				if (isAdmin) {
					ev.channel.send(  
						'Admin-related commands:\n```md\n' + 
						'< !a > unrank <game_id>                     : Make a ranked game not ranked\n' +
						'< !a > addalias <user> <alias>              : Add an alias to a player\n' + 
						'< !a > removealias <alias>                  : Remove an alias from a player\n' + 
						'< !a > blockalias <alias>                   : Block an alias from being added to any account\n' + 
						'< !a > unblockalias <alias>                 : Unblock an alias\n' + 
						'< !a > sync                                 : Sync bot rank with discord rank```' + 
						'Super-admin commands:\n```md\n' +  
						'< !a > mergealiases <old_alias> <new_alias> : Merge two aliases (be careful: this cannot be undone)\n' + 
						'< !a > deletealias <alias>                  : Delete all stats from an alias (be careful: this cannot be undone)\n' + 
						'```'
					);   
				} else {
					ev.channel.send('Only admins can use this command! **Oink!** :pig:');
				}
			});
		} else if (cmd == 'a') {
			ev.guild.members.fetch(ev.author.id).then(function(author) {
				var isAdmin = false;
				var isSuperAdmin = false; 
				author.roles.cache.forEach(function(role) {
					if (role == '340206323708985345') {
						isAdmin = true; 
					} else if (role == '417775674586169355') {
						isSuperAdmin = true; 
					}
				});
				if (isAdmin) { 
					if (args[0] == 'addalias') {
						if (ev.mentions.users.array().length == 1) {
							addAlias(ev, encodeURIComponent(args[2]), ev.mentions.users.array()[0].id);
						} else {
							ev.channel.send('Me no understand! Use **!a addalias <user> <alias>**');
						}
					} else if (args[0] == 'removealias') {
						if (args.length == 2) {
							removeAlias(ev, encodeURIComponent(args[1]));
						} else {
							ev.channel.send('Me no understand! Use **!a removealias <alias>**');
						}
					} else if (args[0] == 'blockalias') {
						if (args.length == 2) {
							blockAlias(ev, encodeURIComponent(args[1]));
						} else { 
							ev.channel.send('Me no understand! Use **!a blockalias <alias>');
						}
					} else if (args[0] == 'unblockalias') {
						if (args.length == 2) {
							unblockAlias(ev, encodeURIComponent(args[1]));
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
							mergeAliases(ev, encodeURIComponent(args[1]), encodeURIComponent(args[2]));
						} else { 
							ev.channel.send('Me no understand! Use **!a mergealiases <old_alias> <new_alias>**');
						}
					} else if (args[0] == 'deletealias') {
						if (!isSuperAdmin) {
							ev.channel.send('Only super-admins can use this command! **Oink!!**');
						} else if (args.length == 2) {
							deleteAlias(ev, encodeURIComponent(args[1]));
						} else { 
							ev.channel.send('Me no understand! Use **!a deletealias <alias>**');
						}
					} else if (args[0] == 'sync') {
						syncRank(ev);
					} else {
						ev.channel.send('Admin command not found! **Oink!** :pig:');
					}
				} else {
					ev.channel.send('Only admins can use this command! **Oink!** :pig:');
				}
			});
		} else if (cmd == 'addalias') {
			getAliasOf(ev.author.id, function(err, alias) {
				//if (alias.length > 0) {
				//	ev.channel.send('You can only have one alias per account now. If you want to add another alias, ask an admin! **Oink!!**');
				//} else {
					if (args.length > 0) {
						addAlias(ev, encodeURIComponent(args[0]));
					} else {
						ev.channel.send('Me no understand! Type **!addalias <account>**, replacing **<account>** by your Warcraft 3 account.');
					} 
				//}
			});
		} else {
			getAliasOf(ev.author.id, async function(err, alias) {
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
												'[     -] [D-Rank] < !mission rank-chunnin >     : Play over <10> games, have more than <50> average points and play a ranked game today with >= <15> kills and <= <15> deaths\n\n' + 
												'[     -] [C-Rank] < !mission rank-tokubetsu >   : Play over <25> games, have more than <100> average points and play a ranked game today with >= <20> kills and <= <12> deaths\n\n' + 
												'[     -] [B-Rank] < !mission rank-jounin >      : Play over <35> games, have more than <150> average points and play a ranked game today with >= <30> kills and <= <10> deaths\n\n' + 
												'[     -] [A-Rank] < !mission rank-anbu >        : Play over <50> games, have more than <200> average points and play a ranked game today with >= <35> kills and <= <8> deaths\n\n' + 
												'[     -] [S-Rank] < !mission rank-kage>         : Be Top-1 on ranking of your village and get the Kage rank```';
								ev.channel.send(response);
							} else {
								displayMissions(ev);
							}
							break; 
						case 'mc':
							completeAllMissions(ev);
							break;
						case 'm':
						case 'mission':
							if (args.length > 0) {
								switch (args[0]) {
									case 'complete':
										completeAllMissions(ev);
										break;
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
							'[1] [Frog lvl. 1]     : Requires level 10, 100,000g (Increase mission reward by 150%)\n' + 
							'[2] [Frog lvl. 2]     : Requires level 25, 1,000,000g (Increase mission reward by 250%)\n' + 
							'[3] [Frog lvl. 3]     : Requires level 50, 10,000,000g (Increase mission reward by 500%)\n' + 
							'[4] [Snake lvl. 1]    : Requires level 10, 100,000g (Increase chance of gambling by 10%)\n' + 
							'[5] [Snake lvl. 2]    : Requires level 25, 1,000,000g  (Increase chance of gambling by 15%)\n' + 
							'[6] [Snake lvl. 3]    : Requires level 50, 10,000,000g (Increase chance of gambling by 25%)\n' +
							'[7] [Slug lvl. 1]     : Requires level 10, 100,000g (Decrease mission requirement by 1)\n' + 
							'[8] [Slug lvl. 2]     : Requires level 50, 10,000,000g (Decrease mission requirement by 2)\n' + 
							'[9] [Hawk]            : Requires level 25, 1,000,000g (Increase rob chance by 10%)\n' + 
							'[10] [Crow]           : Requires level 25, 1,000,000g (Decrease chance of being robbed by 15%)\n' + 
							'[11] [Dog]            : Requires level 15, 150,000g (10% chance to get 20x reward on missions)```');
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
									ev.channel.send('Summon not found. :( **Oink!** :pig:');
								}
							} else {
								ev.channel.send('Me no understand! Use **!summon <summon_id>**');
							}
							break;
						case 'villages':
							ev.channel.send('**Oink, oink**!\nHere are the villages you can join\n' + 
							'```\md\nUse !join <village> to join a village\n' + 
							'Konohagakure : Requires level 1, 0g\n' + 
							'  Sunagakure : Requires level 5, 1,000g\n' + 
							'  Kirigakure : Requires level 5, 1,000g\n' + 
							'  Kumogakure : Requires level 5, 1,000g\n' + 
							'   Iwagakure : Requires level 5, 1,000g\n' +
							'   Otogakure : Requires level 15, 100,000g\n' + 
							'    Akatsuki : Requires level 50, 10,000,000g```');
							break;
						case 'join':
							if (args.length == 1) {
								join(ev, args[0].toLowerCase());
							} else {
								ev.channel.send('Me no understand! Use **!join <village>**');
							}
							break;
						case 'characters':
							displayCharacters(ev);
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
						/*case 'h':
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
							break;*/
						/*case 'lobby':
							displayGames(ev, hostedGames, false, false);
							break; 
						case 'p':
						case 'progress':
							displayGames(ev, inProgressGames, false, true);
							break;*/
						/*case 'l':
						case 'last':
							displayLastGames(ev);
							break;*/
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
						case 'o':
						case 'optimal': 
							var mentionId = 0;
							for (var i = 0; i < args.length; i++) {
								if (args[i].toString()[0] == '<') {
									args[i] = ev.mentions.users.array()[mentionId++].id
								}
							}
							/*if (args.length == 1) {
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
							}*/
							balance(ev, args);
							break;
						case 'r':
						case 'record':
							if (args.length == 1) {
								recordGame(ev, encodeURIComponent(args[0]));
							} else {
								ev.channel.send('Me no understand! Use **!record <code>**');
							}
							break;
						/*case 'subscribe':
							subscribe(ev);
							break;*/
						/*case 'u':
						case 'unrecordable':
							if (args.length == 1) {
								unrecordableGame(ev, args[0]);
							} else { 
								ev.channel.send('Me no understand! Use **!unrecordable <game_id>**');
							}
							break; */
						case 'n':
						case 'rank':
						case 'ranking': 
							if (args.length == 1 && ev.mentions.users.array().length == 0 && args[0].startsWith('5e')) {
								recordRankedGame(bot, ev, args[0]);
							} else if (args.length == 3) {
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
									displayScore(ev, encodeURIComponent(args[0]));
								} 
							} else {
								displayScore(ev, ev.author.id);
							}
							break;
						case 'hs':
						case 'history':
							var heroName = '';
							for (var i = 1; i < args.length; i++) {
								heroName += args[i];
								if (i != args.length - 1) heroName += ' ';
							}
							if (args.length > 0) {
								if (ev.mentions.users.array().length > 0) {
									displayScore(ev, ev.mentions.users.array()[0].id, true, escape(heroName));
								} else {
									displayScore(ev, encodeURIComponent(args[0]), true, escape(heroName));
								} 
							} else {
								displayScore(ev, ev.author.id, true, escape(heroName));
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
							if (args.length > 0) {
								var heroName = '';
								for (var i = 0; i < args.length; i++) {
									heroName += args[i];
									if (i != args.length - 1) heroName += ' ';
								}
								displayHero(ev, escape(heroName));
							} else {
								ev.channel.send('Me no understand! Use **!hero <name>**');
							}
							break;
						case 'tip':
						case 'tips':
							if (args.length > 0) {
								heroExists(args[0], function(exists) {
									if (exists) {
										var tip = '';
										for (var i = 1; i < args.length; i++) {
											tip += args[i];
											if (i != args.length - 1) tip += ' ';
										}
										if (!tip) {
											tipsShow(ev, escape(args[0]), 0);
										} else {
											tipCreate(ev, escape(args[0]), tip);
										}
									} else {
										var heroName = args[0] + ' ' + args[1];
										var tip = '';
										for (var i = 2; i < args.length; i++) {
											tip += args[i];
											if (i != args.length - 1) tip += ' ';
										}
										if (!tip) {
											tipsShow(ev, escape(heroName), 0);
										} else {
											tipCreate(ev, escape(heroName), tip);
										}
									}
								});
							} else {
								ev.channel.send('Me no understand! Use **!tip <hero_name> <tip>**');
							}
							break;
						case 'w':
						case 'whois': 
							if (args.length == 1) {
								whoIs(ev, encodeURIComponent(args[0]));
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
						/*case 'broadcast':
							if (broadcastings.hasOwnProperty(ev.channel)) { 
								delete broadcastings[ev.channel];
								ev.channel.send('Broadcasting disabled.');
							} else {
								broadcastings[ev.channel] = ev;
								ev.channel.send('Broadcasting hosted games. (Use again to disable it)');
							}
							break;*/
						case 'bug':
							if (args.length > 0) {
								var channel = await bot.channels.fetch('692551415394205746');
								channel.send(args.join(' ') + '\n\n**React with :thumbsup: to increase the priority of this bug.**').then(function(message) {
									message.react('👍').then(function(){
										message.react('👎');
									});
									ev.channel.send('Bug reported in <#692551415394205746> . Thank you!! **Oink!** :pig:');
								});
							} else {
								ev.channel.send('You need to type a description! **Oink**! :pig:')
							}
							break; 
						case 'balance':
							if (args.length > 0) {
								var channel = await bot.channels.fetch('692551380786872352');
								channel.send(args.join(' ') + '\n\n**React with :thumbsup: if you agree and :thumbsdown: if you disagree.**').then(function(message) {
									message.react('👍').then(function(){
										message.react('👎');
									});
									ev.channel.send('Issue created in <#692551380786872352> . Thank you!! **Oink!** :pig:');
								});
							} else {
								ev.channel.send('You need to type a description! **Oink**! :pig:')
							}
							break; 
						case 'idea':
							if (args.length > 0) {
								var channel = await bot.channels.fetch('692551338743037952');
								channel.send(args.join(' ') + '\n\n**React with :thumbsup: if you agree and :thumbsdown: if you disagree.**').then(function(message) {
									message.react('👍').then(function(){
										message.react('👎');
									});
									ev.channel.send('Idea posted in <#692551338743037952> . Thank you!! **Oink!** :pig:');
								});
							} else {
								ev.channel.send('You need to type a description! **Oink**! :pig:')
							}
							break; 
						case 'poll':
							if (args.length > 0) {
								var channel = await bot.channels.fetch('692543421826727968');
								channel.send(args.join(' ') + '\n\n**React with :thumbsup: for yes and :thumbsdown: for no.**').then(function(message) {
									message.react('👍').then(function(){
										message.react('👎');
									});
									ev.channel.send('Poll created in <#692543421826727968> . Thank you!! **Oink!** :pig:');
								});
							} else {
								ev.channel.send('You need to type a description! **Oink**! :pig:')
							}
							break; 
						case 'attack':
							var insults = ['noob', 'team stacker', 'feeder', 'leaver', 'rage-quitter', 'shithead', 'idiot', 'camper', 'Tobias\' cuck', 'so bad in Ninpou that I\'m pity', 'feeder as Madara', 'feeder as Minato', 'noob who doesn\'t know for what Smoke Bomb is for', 'noob who doesn\'t the price of Oil', 'hentai lover', 'worse than Fexter', 'guy who lost 1v1 to Fexter', 'teenage with a girl\'s voice', 'coward who can\'t win 1v1', 'fool', 'guy who keeps dildos', 'vegan', 'Fexter', 'Tobias'];
							ev.channel.send('*attacks ' + args[0] + ' and says: ' + args[0] + ' is a ' + insults[Math.floor(Math.random() * insults.length)] + '.* **Oink!** :pig:');
							break;
					 }
				}
			});
		}
     }
});

bot.login(process.env.BOT_TOKEN); 
