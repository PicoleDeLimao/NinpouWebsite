'use strict';

var encodedPlayersId = [];
encodedPlayersId[0] = 6;
encodedPlayersId[1] = 10;
encodedPlayersId[2] = 0;
encodedPlayersId[3] = 9;
encodedPlayersId[4] = 5;
encodedPlayersId[5] = 4;
encodedPlayersId[6] = 2; 
encodedPlayersId[7] = 1;
encodedPlayersId[8] = 8;

var encodedInts = [];
encodedInts[5] = "0";
encodedInts[84] = "1";
encodedInts[21] = "2";
encodedInts[78] = "3";
encodedInts[44] = "4";
encodedInts[45] = "5";
encodedInts[76] = "6";
encodedInts[41] = "7";
encodedInts[25] = "8";
encodedInts[67] = "9";
encodedInts[39] = "a";
encodedInts[23] = "b";
encodedInts[85] = "c";
encodedInts[74] = "d";
encodedInts[11] = "e";
encodedInts[30] = "f";
encodedInts[24] = "g";
encodedInts[66] = "h";
encodedInts[42] = "i";
encodedInts[0] = "j";
encodedInts[77] = "k";
encodedInts[59] = "l";
encodedInts[49] = "m";
encodedInts[9] = "n";
encodedInts[79] = "o";
encodedInts[61] = "p";
encodedInts[69] = "q";
encodedInts[83] = "r";
encodedInts[8] = "s";
encodedInts[27] = "t";
encodedInts[16] = "u";
encodedInts[75] = "v";
encodedInts[70] = "w";
encodedInts[18] = "x";
encodedInts[62] = "y";
encodedInts[65] = "z";
encodedInts[7] = "A";
encodedInts[82] = "B";
encodedInts[19] = "C";
encodedInts[52] = "D";
encodedInts[38] = "E";
encodedInts[56] = "F";
encodedInts[6] = "G";
encodedInts[28] = "H";
encodedInts[58] = "I";
encodedInts[57] = "J";
encodedInts[17] = "K";
encodedInts[29] = "L";
encodedInts[68] = "M";
encodedInts[34] = "N";
encodedInts[54] = "O";
encodedInts[26] = "P";
encodedInts[81] = "Q";
encodedInts[2] = "R";
encodedInts[12] = "S";
encodedInts[50] = "T";
encodedInts[89] = "U";
encodedInts[71] = "V";
encodedInts[15] = "W";
encodedInts[47] = "X";
encodedInts[22] = "Y";
encodedInts[35] = "Z";
encodedInts[20] = ">";
encodedInts[32] = "|";
encodedInts[10] = ";";
encodedInts[87] = "/";
encodedInts[46] = "[";
encodedInts[64] = "]";
encodedInts[1] = "+";
encodedInts[53] = "'";
encodedInts[43] = "-";
encodedInts[60] = "*";
encodedInts[13] = "/";
encodedInts[37] = "<";
encodedInts[3] = ",";
encodedInts[80] = ":";
encodedInts[72] = "?";
encodedInts[33] = "{";
encodedInts[63] = "}";
encodedInts[55] = "!";
encodedInts[36] = "\"";
encodedInts[14] = "@";
encodedInts[40] = "#";
encodedInts[86] = "$";
encodedInts[51] = "%";
encodedInts[73] = "(";
encodedInts[31] = ")";
encodedInts[4] = ".";
encodedInts[88] = "=";
encodedInts[48] = "\\";

function decodeInt(string) {
	for (var i = 0; i < 90; i++) {
		if (encodedInts[i] === string) {
			return i;
		}
	}
	return -1;
};

function getSlotId(playerId) {
	if (playerId < 3) return playerId;
	else if (playerId > 3 && playerId < 7) return playerId - 1;
	else return playerId - 2;
};

function decodeCharacter(character) {
	var i = 0;
	for (; i < 90; i++) {
		if (encodedInts[i] === character) {
			break;
		}
	}
	i = i - 10;
	if (i < 0) {
		i = 89 + i;
	}
	return encodedInts[i];
};

function addZero(s) {
	s = "" + s;
	if (s.length == 1) {
		return "0" + s;
	}
	return s;
}

function decodeGame(body, game, callback) {
	//body = body.replace(/\//g, '\\');
	console.log(body);
	for (var i = 0; i < 9; i++) {
		game.slots.push({
			username: null,
			realm: 'Unknown'
		});
	}
	var decoded = [];
	for (var i = 0; i < body.length; i++) {
		decoded.push(decodeInt(body[i]));
	}
	var index = 0;
	var count = 0;
	var sum = decoded[index++];
	game.duration = addZero(Math.floor(decoded[index] / 60)) + ":" + addZero(decoded[index] % 60) + ":00";
	++index;
	var winningTeam = decoded[index++];
	for (var i = 0; i < 9; i++) {
		var state;
		do {
			state = encodedInts[decoded[index++]];	
		} while (state != '0' && state != '1' && state != '2' && index < decoded.length);
		var playerIndex = encodedPlayersId[i];
		var slot = getSlotId(encodedPlayersId[i]);
		if (state == '0') {
			game.slots[slot].state = 'EMPTY';
		} else if (state != '1' && state != '2') {
			return callback('Invalid code.');
		} else {
			++game.players;
			if (state == '1') {
				game.slots[slot].state = 'PLAYING';
			} else { 
				game.slots[slot].state = 'LEFT';
			}
			var letter = body[index++].toLowerCase();
			game.slots[slot].hero = decoded[index++];
			game.slots[slot].kills = decoded[index++];
			game.slots[slot].deaths = decoded[index++];
			game.slots[slot].assists = decoded[index++];
			game.slots[slot].points = game.slots[slot].kills * 10 + game.slots[slot].assists * 2 - game.slots[slot].deaths * 5;
			game.slots[slot].gpm = decoded[index++]; 
			count += Math.floor(game.slots[slot].gpm / 10);
			var nameLength = decoded[index++];
			game.slots[slot].username = "";
			for (var j = 0; j < nameLength; j++) {
				var nameIndex = decoded[index++] - 10;
				if (nameIndex < 0) nameIndex = 90 + nameIndex;
				if (isNaN(nameIndex)) {
					game.slots[slot].username += '_';
					continue;
				}
				var c = encodedInts[nameIndex].toLowerCase();
				if (c === ",") c = "k";
				game.slots[slot].username += c;
			}
			game.slots[slot].username = game.slots[slot].username.substring(0, game.slots[slot].username.length - 4);
			if (/[a-zA-Z0-9]/.test(letter) && letter != game.slots[slot].username[0]) return callback('Invalid code.');
			game.slots[slot].win = (winningTeam == 3 && (playerIndex == 0 || playerIndex == 1 || playerIndex == 2)) || (winningTeam == 7 && (playerIndex == 4 || playerIndex == 5 || playerIndex == 6)) || (winningTeam == 11 && (playerIndex == 8 || playerIndex == 9 || playerIndex == 10));
		}
	}
	//if (count + 1 != sum) return callback('Invalid code.'); 
	return callback(null, game);
}

module.exports = {
	decodeGame
};