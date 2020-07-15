'use strict';

var http = require('http'); 
var getPlayerName = require('./getplayername');
var Jimp = require('jimp');
var Discord = require('discord.js');

async function getVillageOfUser(user) {
    return new Promise((resolve, reject) => {
        http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + user }, function(res) {
            var statusCode = res.statusCode;
            var body = '';
            res.on('data', function(data) {
                body += data; 
            });
            res.on('end', function() {
                try {
                    var data = JSON.parse(body);
                    if (statusCode != 200) {
                        reject(data.error);
                    } else {
                        resolve(data); 
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });
    });
}

async function getUserAvatar(ev, id) {
    return new Promise((resolve, reject) => {
        ev.client.users.fetch(id).then(function(user) {
            var avatarURL = user.displayAvatarURL();
            Jimp.read(avatarURL, function(err, image) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(image.resize(32, 32));
            });
        }).catch(function(err) {
            reject(err);
        });
    });
}

module.exports = async function(ev, villageName) {
    if (!villageName) {
        try {
            var userData = await getVillageOfUser(ev.author.id);
            villageName = userData.affiliation;
            if (villageName !== "otogakure" && villageName !== "akatsuki") {
                villageName = "shinobi alliance";
            }
        } catch (err) {
            console.error(err);  
		    ev.channel.send('Couldn\'t fetch village. :( **Oink!** :pig:');
        }
    }
    if (villageName === "oto") {
        villageName = "otogakure";
    }
    if (villageName !== "otogakure" && villageName !== "akatsuki") {
        villageName = "shinobi alliance";
    }
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/villages/' + villageName }, function(res) {
		var statusCode = res.statusCode;
		var body = '';
		res.on('data', function(data) {
			body += data; 
		});
		res.on('end', async function() {
			try {
				var data = JSON.parse(body);
				if (statusCode != 200) {
					ev.channel.send(data.error);
				} else { 
                    var filename;
                    if (villageName === "otogakure") {
                        filename = "layout_otogakure";
                    } else if (villageName === "akatsuki") {
                        filename = "layout_akatsuki";
                    } else {
                        filename = "layout_shinobi_alliance";
                    }
					Jimp.read('public/images/' + filename + '.png', async function(err, layout) {
                        if (err) {
                            console.error(err); 
                            ev.channel.send('Couldn\'t fetch village. :( **Oink!** :pig:');
                            return;
                        }
                        for (var i = 0; i < Math.min(1, data.kage.length); i++) {
                            var id = data.kage[i];
                            try {
                                var userAvatar = await getUserAvatar(ev, id);
                                layout.composite(userAvatar, 150, 24);
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        for (var i = 0; i < Math.min(2, data.anbu.length); i++) {
                            var id = data.anbu[i];
                            try {
                                var userAvatar = await getUserAvatar(ev, id);
                                if (i == 0) {
                                    layout.composite(userAvatar, 130, 84);
                                } else if (i == 1) {
                                    layout.composite(userAvatar, 170, 84);
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        for (var i = 0; i < Math.min(3, data.jounin.length); i++) {
                            var id = data.jounin[i];
                            try {
                                var userAvatar = await getUserAvatar(ev, id);
                                if (i == 0) {
                                    layout.composite(userAvatar, 111, 140);
                                } else if (i == 1) {
                                    layout.composite(userAvatar, 150, 140);
                                } else if (i == 2) {
                                    layout.composite(userAvatar, 190, 140);
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        for (var i = 0; i < Math.min(3, data["tokubetsu jounin"].length); i++) {
                            var id = data["tokubetsu jounin"][i];
                            try {
                                var userAvatar = await getUserAvatar(ev, id);
                                if (i == 0) {
                                    layout.composite(userAvatar, 111, 200);
                                } else if (i == 1) {
                                    layout.composite(userAvatar, 150, 200);
                                } else if (i == 2) {
                                    layout.composite(userAvatar, 190, 200);
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }
                        layout.write('public/images/layouts/' + villageName + '.png');
						var previewCacheUrl = '?_=' + (new Date()).getTime();
                        var img = 'http://www.narutoninpou.com/images/layouts/' + villageName + '.png' + previewCacheUrl;
						var msgEmbed = new Discord.MessageEmbed() 
								.setImage(img);
                        ev.channel.send(msgEmbed);
                    });
				}
			} catch (err) { 
				console.error(err); 
				ev.channel.send('Couldn\'t fetch village. :( **Oink!** :pig:');
			}
		});
	}).on('error', function(err) {
		console.error(err);  
		ev.channel.send('Couldn\'t fetch village. :( **Oink!** :pig:');
	});
};
