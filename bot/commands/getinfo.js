'use strict';

var http = require('http');
var Discord = require('discord.js');
var getPlayerName = require('./getplayername');
var printGold = require('./printgold');

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

function getSummonName(summon) {
	if (summon == 'frog1') {
		return 'Gamakichi';
	} else if (summon == 'frog2') {
		return 'Gamahiro';
	} else if (summon == 'frog3') {
		return 'Gamabunta';
	} else if (summon == 'snake1') {
		return 'Snake lvl. 1';
	} else if (summon == 'snake2') {
		return 'Snake lvl. 2';
	} else if (summon == 'snake3') {
		return 'Manda';
	} else if (summon == 'slug1') {
		return 'Katsuyu lvl. 1';
	} else if (summon == 'slug2') {
		return 'Katsuyu lvl. 2';
	} else if (summon == 'hawk') {
		return 'Hawk';
	} else if (summon == 'crow') {
		return 'Crow';
	} else if (summon == 'dog') {
		return 'Paku';
	} else {
		return 'None';
	}
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
						'Kuchiyose: [' + getSummonName(data.summon) + ']\n' + 
						'Village:   [' + (data.affiliation && (data.affiliation.charAt(0).toUpperCase() + data.affiliation.substr(1)) || 'None') + ']\n' + 
						'Level:     [' + (data.level || 1) + ']\n' + 
						'XP:        [' + (data.xp || 0) + '%]\n' + 
						'Rank:      [' + (data.rank && (data.rank.charAt(0).toUpperCase() + data.rank.substr(1)) || 'Genin') + ']\n' + 
						'Gold:      [' + printGold(Math.round(data.gold) || 0) + ']``` ```ini\n' + 
						'HP:        [' + getHP(data) + ']\n' + 
						'Attack:    [' + getAttack(data) + ']\n' + 
						'Armor:     [' + getArmor(data) + ']\n\n' +
						'Weapon:    \n' + getItem(data.itemWeapon, spaces) + '\n' +
						'Cloth:     \n' + getItem(data.itemArmor, spaces) + '\n' + 
						'Accessory: \n' + getItem(data.itemSupport, spaces) + '```'; 
						var previewCacheUrl = '?_=' + (new Date()).getTime();
						var img = 'http://www.narutoninpou.com/images/users/' + user + '.png' + previewCacheUrl;
						var msgEmbed = new Discord.RichEmbed() 
								.setTitle(name + ', level ' + (data.level || 1) + ' ' + (data.affiliation && data.affiliation != 'none' && (data.affiliation.charAt(0).toUpperCase() + data.affiliation.substr(1) + ' ') || '') + (data.rank && (data.rank.charAt(0).toUpperCase() + data.rank.substr(1)) || 'Genin'))
								.setDescription(response)
								.setImage(img)
								.setFooter(data.status || '');
						//ev.channel.send(response, {
						//	file: 'public/images/users/' + user + '.png'
						//});
						ev.channel.send(msgEmbed);
					}, true) 
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
