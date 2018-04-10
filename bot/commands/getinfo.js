'use strict';

var http = require('http');
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
						name + '\n' + 
						'Gold :     [' + (data.gold || 0) + ']\n' + 
						'Level:     [' + (data.level || 1) + ']\n' + 
						'XP:        [' + (data.xp || 0) + '%]\n\n' + 
						'HP:        [' + getHP(data) + ']\n' + 
						'Attack:    [' + getAttack(data) + ']\n' + 
						'Armor:     [' + getArmor(data) + ']\n' +
						'Weapon:    ' + getItem(data.itemWeapon, spaces) + '\n' +
						'Cloth:     ' + getItem(data.itemArmor, spaces) + '\n' + 
						'Accessory: ' + getItem(data.itemSupport, spaces) + '\n\n' + 
						(data.status ? ('Status:\n' + data.status) : '') + '\n```'; 
						ev.channel.send(response);
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
