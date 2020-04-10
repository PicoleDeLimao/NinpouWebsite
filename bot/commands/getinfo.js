'use strict';

var http = require('http');
var Discord = require('discord.js');
var getPlayerName = require('./getplayername');
var printGold = require('./printgold');

function getItem(item, spaces) {
	if (!item) return '';
	var res = item.name;
	res += ' lvl. ' + item.level + ' [ ';
	if (item.attackBonus) res += '+' + printGold(item.attackBonus * item.level) + ' attack ';
	if (item.armorBonus) res += '+' + printGold(item.armorBonus * item.level) + ' armor ';
	if (item.hpBonus) res += '+' + printGold(item.hpBonus * item.level) + ' hp ';
	res += ']';
	return res; 
};

function getHP(data) {
	var base = (data.level || 1) * 100;
	if (data.itemWeapon) base += (data.itemWeapon.hpBonus * data.itemWeapon.level);
	if (data.itemArmor) base += (data.itemArmor.hpBonus * data.itemArmor.level);
	if (data.itemSupport) base += (data.itemSupport.hpBonus * data.itemSupport.level);
	return base; 
}

function getAttack(data) {
	var base = (data.level || 1) * 10;
	if (data.itemWeapon) base += (data.itemWeapon.attackBonus * data.itemWeapon.level);
	if (data.itemArmor) base += (data.itemArmor.attackBonus * data.itemArmor.level);
	if (data.itemSupport) base += (data.itemSupport.attackBonus * data.itemSupport.level);
	return base;  
}

function getArmor(data) {
	var base = (data.level || 1) * 5;
	if (data.itemWeapon) base += (data.itemWeapon.armorBonus * data.itemWeapon.level);
	if (data.itemArmor) base += (data.itemArmor.armorBonus * data.itemArmor.level);
	if (data.itemSupport) base += (data.itemSupport.armorBonus * data.itemSupport.level);
	return base; 
}

function getSummonName(summon) {
	if (summon == 'frog1') {
		return 'Gamakichi';
	} else if (summon == 'frog2') {
		return 'Gamabunta';
	} else if (summon == 'frog3') {
		return 'Two great sage toads';
	} else if (summon == 'snake1') {
		return 'Snake lvl. 1';
	} else if (summon == 'snake2') {
		return 'Manda';
	} else if (summon == 'snake3') {
		return 'Aoda';
	} else if (summon == 'slug1') {
		return 'Katsuyu lvl. 1';
	} else if (summon == 'slug2') {
		return 'Katsuyu lvl. 2';
	} else if (summon == 'hawk') {
		return 'Hawk';
	} else if (summon == 'crow') {
		return 'Crow';
	} else if (summon == 'dog') {
		return 'Pakkun';
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
				ev.channel.send('This user doesn\'t exist. **Oink!** :pig:');
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
						'HP:        [' + printGold(getHP(data)) + ']\n' + 
						'Attack:    [' + printGold(getAttack(data)) + ']\n' + 
						'Armor:     [' + printGold(getArmor(data)) + ']\n\n' +
						'Weapon:    \n' + getItem(data.itemWeapon, spaces) + '\n' +
						'Cloth:     \n' + getItem(data.itemArmor, spaces) + '\n' + 
						'Support:   \n' + getItem(data.itemSupport, spaces) + '```'; 
						var previewCacheUrl = '?_=' + (new Date()).getTime();
						var img = 'http://www.narutoninpou.com/images/users/' + user + '.png' + previewCacheUrl;
						var msgEmbed = new Discord.MessageEmbed() 
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
					ev.channel.send('Couldn\'t fetch user info. :( **Oink!** :pig:');
				}
			}
		});
	})
	.on('error', function(err) {
		console.error(err); 
		ev.channel.send('Couldn\'t fetch alias. :( **Oink!** :pig:');
	}); 
};
