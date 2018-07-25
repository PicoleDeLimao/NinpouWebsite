'use strict';

var http = require('http');
var Discord = require('discord.js');
var getPlayerName = require('./getplayername');

function getItem(item, spaces) {
	if (!item) return '';
	var res = item.name;
	res += ' [ ';
	if (item.attackBonus) res += '+' + item.attackBonus + ' attack ';
	if (item.armorBonus) res += '+' + item.armorBonus + ' armor ';
	if (item.hpBonus) res += '+' + item.hpBonus + ' hp ';
	res += ']';
	return res; 
};

function getHP(data) {
	var base = (data.level || 1) * 100;
	if (data.itemWeapon) base += data.itemWeapon.hpBonus;
	if (data.itemArmor) base += data.itemArmor.hpBonus;
	if (data.itemSupport) base += data.itemSupport.hpBonus;
	return base; 
}

function getAttack(data) {
	var base = (data.level || 1) * 10;
	if (data.itemWeapon) base += data.itemWeapon.attackBonus;
	if (data.itemArmor) base += data.itemArmor.attackBonus;
	if (data.itemSupport) base += data.itemSupport.attackBonus;
	return base;  
}

function getArmor(data) {
	var base = (data.level || 1) * 5;
	if (data.itemWeapon) base += data.itemWeapon.armorBonus;
	if (data.itemArmor) base += data.itemArmor.armorBonus;
	if (data.itemSupport) base += data.itemSupport.armorBonus;
	return base; 
}

module.exports = function(ev, user) { 
	http.get({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/alias/' + user, headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() { 
			if (res.statusCode != 200) { 
				ev.channel.send('This user doesn\'t exist. **Oink!**');
			} else {
				try { 
					var data = JSON.parse(body); 
					getPlayerName(ev, user, function(err, name) {
						var spaces = Math.max(data.itemWeapon && data.itemWeapon.name.length || 0, 
										Math.max(data.itemArmor && data.itemArmor.name.length || 0, 
										data.itemSupport && data.itemSupport.name.length || 0));
						var response = '```ini\n' + 
						'Character: [' + (data.character && (data.character.charAt(0).toUpperCase() + data.character.substr(1)) || 'None') + ']\n' + 
						'Village:   [' + (data.affiliation && (data.affiliation.charAt(0).toUpperCase() + data.affiliation.substr(1)) || 'None') + ']\n' + 
						'Level:     [' + (data.level || 1) + ']\n' + 
						'XP:        [' + (data.xp || 0) + '%]\n' + 
						'Rank:      [' + (data.rank && (data.rank.charAt(0).toUpperCase() + data.rank.substr(1)) || 'Genin') + ']\n' + 
						'Gold:      [' + (Math.round(data.gold) || 0) + ']``` ```ini\n' + 
						'HP:        [' + getHP(data) + ']\n\n' + 
						'Attack:    [' + getAttack(data) + ']\n' + 
						'Armor:     [' + getArmor(data) + ']\n' +
						'Weapon:    \n' + getItem(data.itemWeapon, spaces) + '\n' +
						'Cloth:     \n' + getItem(data.itemArmor, spaces) + '\n' + 
						'Accessory: \n' + getItem(data.itemSupport, spaces) + '```'; 
						var previewCacheUrl = '?_=' + (new Date()).getTime();
						var img = 'http://www.narutoninpou.com/images/users/' + user + '.png' + previewCacheUrl;
						//img = 'https://m.media-amazon.com/images/M/MV5BOGQxYjdiMzQtODZmYi00MzExLWJkMTQtMWYyNTE1ZjQxNDk4XkEyXkFqcGdeQXVyNzI2MzA2OTE@._V1_SX1777_CR0,0,1777,999_AL_.jpg';
						var msgEmbed = new Discord.RichEmbed() 
								.setTitle(name + ', level ' + (data.level || 1) + ' ' + (data.affiliation && data.affiliation != 'none' && (data.affiliation.charAt(0).toUpperCase() + data.affiliation.substr(1) + ' ') || '') + (data.rank && (data.rank.charAt(0).toUpperCase() + data.rank.substr(1)) || 'Genin'))
								.setDescription(response)
								.setImage(img)
								.setFooter(data.status || '');
						//ev.channel.send(response, {
						//	file: 'public/images/users/' + user + '.png'
						//});
						ev.channel.send(msgEmbed);
					}) 
				} catch (err) {
					console.error(err);
					ev.channel.send('Couldn\'t fetch user info. :( **Oink!**');
				}
			}
		});
	})
	.on('error', function(err) {
		console.error(err); 
		ev.channel.send('Couldn\'t fetch alias. :( **Oink!**');
	}); 
};
