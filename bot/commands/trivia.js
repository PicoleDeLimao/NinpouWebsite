
module.exports = function(bot) {
		
	var trivia = {};
	trivia['naruto'] = [
		["Who was the first ninja to be attacked by Naruto's Rasengan-Shuriken?", "Kakuzu"],
		["Which ninja uses a Yin Seal?", "Tsunade"],
		["What is the last hand sign for the Uchiha Clan's Fireball Jutsu?", "Tiger"],
		["Who was the newest member to join the Akatsuki?", "Hidan"],
		["In the Naruto manga, which jinchuuriki was the first to be captured?", "Isobu"],
		["Who justified ending the life of a fellow Akatsuki member on the grounds of winning a battle?", "Deidara"],
		["Who was the head of the Intelligence Division in the Fourth Great Ninja War?", "Inoichi"],
		["Who destroyed the boulder to get into the cave in the beginning of Shippuden?", "Sakura"],
		["Who used the Six Red Yang Formation during a battle?", "Minato"],
		["Who uses a magnet release?", "Sasori"],
		["Which Kirigakure ninja was killed by Kakashi?", "Haku"],
		["Who has the ability to record battles?", "Black Zetsu"],
		["What is Yamato's real name?", "Tenzo"],
		['Who once said during a battle, "There is no such thing as peace. There is no such thing as hope."', "Obito"],
		["In the Naruto manga, which tailed beast showed up the least?", "Chomei"],
		["Who uses the Seven Swords Dance Technique?", "Killer Bee"],
		["Who was the first ninja Sasuke copied?", "Rock Lee"],
		["Who was the last ninja to control the nine-tailed fox before Naruto?", "Obito"],
		["Which ninja uses Kenjutsu?", "Hayate"],
		["Which Hokage used Shuriken Clone Jutsu during a battle?", "Sarutobi"],
		["Who fought Pain to protect Naruto?", "Hinata"],
		["What is name of the guy that made Naruto", "Masashi Kishimoto"],
		["What does Naruto call Rock Lee?", "Brushybrow"],
		["What is the Aburame clan special ability?", "Bug manipulation"],
		["What is the Akimichi clan special ability?", "Body expansion"],
		["What is the Inuzuka clan special ability?", "Dogs"],
		["What is the Kaguya clan special ability?", "Bone manipulation"],
		["Who had the Earth Curse Mark Seal?", "Kimimaro"],
		["What is the Kamizuru clan special ability?", "Bee manipulation"],
		["Who stole Zabuza's sword?", "Suigetsu"],
		["Who was Naruto's teacher at the ninja academy?", "Iruka"],
		["What village does Naruto belong to?", "Konohagakure"],
		["What is the name of the Biju inside Gaara?", "Shukaku"],
		["Who is the second hokage of Konoha?", "Tobirama"],
		["Which Akatsuki member killed Asuma?", "Hidan"],
		["Who killed Neji?", "Obito"],
		["Who killed Danzo?", "Sasuke"],
		["Who was suggested as hokage while Tsunade was in a coma?", "Kakashi"],
		["From what village was the ninja who made Sakura cut her hair from?", "Sound"],
		["Who revived Gaara when the Biju was taken out of him?", "Chiyo"],
		["What's the name of Shizune's pet pig?", "Tonton"],
		["Where does Ino wear her ninja headband?", "Hip"],
		["Who has had amnesia when a child?", "Kabuto"],
		["Which country has the samurai?", "Land of Iron"],
		["Who was Madara once close friends with?", "Hashirama"]
		["Who removed the Shikifujin Seal on the Hokage?", "Orochimaru"],
		["Who became the Jinchuuriki of the Ten Tails?", "Obito"],
		["What does Gaara's forehead tattoo stand for?", "Love"],
		["Which clan is Karin a member of?", "Uzumaki"],
		["Where did the Uzumaki clan originate from?", "Land of Whirlpools"],
		["Which is Deidara's highest form of explosive clay?", "C0"],
		["Who proclaimed them self as 'The second sage of six paths'?", "Obito"],
		["Who is officially the Sixth Hokage at the end of the manga series?", "Kakashi"] 
	];
	
	trivia['ninpou'] = [
		['What is the price of Oil?', '2250'],
		['How much damage does Bomb deal?', '800'],
		['What is the price of Banshosen?', '3500'],
		['How much damage does Poison Pills deal per second?', '200'],
		['How much damage does Explosive Tag deal?', '1000'],
		['How many explosive tags does Explosive Tag Package contain?', '8'],
		['Which spirit cannot be upgraded with Kage Robe?', 'Spirit of Darkness'],
		['Which spirit provides armor reduction upon attack?', 'Spirit of Darkness'],
		['Which spirit provides genjutsu bonus?', 'Spirit of Water'],
		['Which spirit provides a chance to stun on each attack?', 'Spirit of Earth'],
		['How much tai does Spirit of Earth provide?', '20'],
		['How much damage does Spirit of Fire provide?', '40'],
		['How much does Badge of ANBU cost?', '4000'],
		['How much does ANBU Mask cost at total?', '7300'],
		['How much does Mirror of Heaven cost?', '4000'],
		['How many support items you can carry?', '2'],
		['How much does Ninja Badge cost?', '800'],
		['How many stats does Ninja Badge provide?', '10'],
		['In what recipe is Ninja Badge used?', 'Kage Robe'],
		['In what recipe is Akatsuki Ring used?', 'Jade of Susano\'o'],
		['In what recipe is Mirror of Heaven used?', 'Heaven 8 Mirror'],
		['What is the cost of Chakra Stone?', '500'],
		['How much chakra does Chakra Stone provide?', '500'],
		['In what recipe is Sword of Full Moon used?', 'Akatsuki Ring'],
		['What\'s the classification of Shield of the Stun?', 'Support'],
		['How long do Edo Tensei units from Edo Tensei Scroll last?', '40s'],
		['What is the number of charges of Chakra Sweets?', '10'],
		['How much chakra each charge of Chakra Sweets recover?', '100'],
		['How many charges does Explosive Package contain?', '7'],
		['How long does Fried Chicken last?', '20s'],
		['How much damage does Fried Chicken increase?', '50%'],
		['How much does Fried Chicken cost?', '500'],
		['How much health does Ichiraku Ramen (BIG) recover?', '1000'],
		['How long does Ichiraku Ramen last?', '10s'],
		['How much health does Ichiraku Ramen (SMALL) recover?', '500'],
		['How much health per second does Medical Sphere recover?', '3%'],
		['Which command is used to store items in your bank?', '-b'],
		['How much chakra does Scroll of Chakra recover?', '1000'],
		['How much Scroll of Chakra cost?', '500'],
		['How much health does Scroll of Healing recover?', '700'],
		['How much health does Scroll of Regeneration recover?', '1500'],
		['How much does Substitution Wood cost?', '2000'],
		['What is the cooldown of Substitution Wood active spell?', '15s'],
		['How much health does each charge of Sushi recover?', '150'],
		['What is the cooldown of Yata Mirror active spell?', '60s'],
		['What effect Yata Mirror provides to the target?', 'invulnerability'],
		['What Heaven Sword active spell (Divine Punish) does?', 'Halve genjutsu and ninjutsu'],
		['How many stats does Eight-headed Serpent provide?', '150'],
		['How many health points does Eight-headed Serpent provide?', '2000'],
		['How much armor does Eight-headed Serpent provide?', '30'],
		['What is the chance to deal critical damage with Eight-headed Serpent?', '15%'],
		['What is the damage of Eight-headed Serpent critical?', '3 x all stats'],
		['How much health does Eight-headed Serpent passive recover?', '5%'],
		['How much damage does Kyuubi\'s Lost Spear provide?', '180'],
		['How much taijutsu does Kyuubi\'s Lost Spear provide?', '100'],
		['What is Kyuubi\'s Lost Spear passive?', 'Immolation'],
		['How many health points does Nidaime Hokage\'s Staff provide?', '1500'],
		['What is the cooldown of Nidaime Hokage\'s Staff active spell?', '20s'],
		['What Nidaime Hokage\'s Staff active spell does?', 'Stun in line'],
		['How many health points does Yondaime\'s Crossbow provide?', '1500'],
		['How much damage does Yondaime\'s Crossbow provide?', '200'],
		['What Yondaime\'s Crossbow active spell does?', 'Teleport'],
		['What is the cost of Genin Cloth?', '3700'],
		['How much jutsu reduction does Genin Cloth provide?', '5%'],
		['How much jutsu reduction does ANBU Cloth provide?', '20%'],
		['What is the highest cloth grade before Kage Robe?', 'Sannin Cloth'],
		['How much does Akatsuki Cloth cost?', '6000'],
		['After how many seconds in stealth you get Speed Boost in Akatsuki Set?', '10s'],
		['What is the cost of Gunbai?', '3000'],
		['What is the cost of Smoke Bomb?', '2250'],
		['How much does the Upgrade Sanbis Skin recipe cost?', '3300'],
		['How much does the Upgrade Stone recipe cost?', '2700'],
		['How much does the Upgrade Super Shoes recipe cost?', '1500'],
		['What is the max level of a Super Shoes?', '3']
		['What is the max movement speed allowed?', '522'],
		['How many health points does the Ninja Shippu Shoes provide?', '500'],
		['What is the total cost of Ninja Shippu Shoes?', '2600'],
		['How many health points does Indra Essence provide?', '875'],
		['How many chakra points does Indra Essence provide?', '3750'],
		['How much damage does Samehada Sword provide?', '190'],
		['How much chakra does Samehada Sword drain on each attack?', '100'],
		['How many stats does Sword of Totsuka provide?', '50'],
		['How much does Sword of Totsuka cost in gold?', '20000'],
		['How many crystals does Sword of Totsuka require?', '6'],
		['What is the cooldown of Sword of Totsuka active spell?', '40s'],
		['How much does Sword of Kusanagi cost?', '5000'],
		['How many transformations does Sasori have?', '2'],
		['What is Juugo main attribute?', 'Taijutsu'],
		['What is Kimimaro main attribute?', 'Ninjutsu'],
		['What is the name of Sakura\'s (D) spell?', 'Chakra Enhanced Strength'],
		['How much does Sakura\'s (E) heal on level 10?', '2000'],
		['Which Kakashi have the Doton: Doryuheki ability?', 'ANBU Kakashi'], 
		['Which Kakashi have the Kamui ability?', 'Jounin Kakashi'],
		['What is the chance to trigger Suigetsu\'s (D)?', '10%'],
		['How much health does Sarutobi\'s (T) take from the user?', '20%'],
		['How long does Sarutobi\'s (T) silence last?', '10s'],
		['How long does Sarutobi\'s Enma last?', '40s'],
		['How many clay creatures does Deidara\'s (W) summon on level 10?', '15'],
		['How long does Deidara\'s (W) summon last?', '20s'],
		['What is the name of Chouji\'s (W) spell?', 'Baika no Jutsu'],
		['Which spell hotkey allow Chouji to grow?', 'W'] 
	];

	var channels = { };

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}
	
	function returnNewQuestion(channel) {
		var category = channel.category;
		var questionID = channel.questions[channel.questionIndex];//Math.floor(Math.random() * trivia[category].length);
		var letters = Array.apply(null, { length: trivia[category][questionID][1].length }).map(Number.call, Number);
		var letters = shuffle(letters);
		channel.questionID = questionID; 
		channel.letters = letters; 
		channel.currentIndex = 0;
		channel.questionIndex = (channel.questionIndex + 1) % trivia[channel.category].length;
		return trivia[category][questionID][0];
	}
	
	function returnQuestionAndTip(channel) {
		var category = channel.category;
		var questionID = channel.questionID;
		var answer = trivia[category][questionID][1];
		var tip = [];
		for (var i = 0; i < answer.length; i++) {
			tip.push('-');
		}
		for (var i = 0; i < channel.currentIndex; i++) {
			var index = channel.letters[i];
			tip[index] = answer.charAt(index);
		}
		var tipStr = '**Tip:** ';
		for (var i = 0; i < tip.length; i++) {
			tipStr += tip[i];
		}
		++channel.currentIndex;
		return trivia[category][questionID][0] + '\n' + tipStr;
	}
	
	function isTipComplete(channel) {
		var category = channel.category;
		var questionID = channel.questionID;
		var answer = trivia[category][questionID][1];
		return channel.currentIndex == answer.length + 1;
	}
	
	function stopTrivia(channel) {
		delete channels[channel.channel];
		channel.ev.channel.send('Trivia disabled. **Oink**!');
	}
	
	function scoreToUserAndReturnScoreboard(user, channel) {
		if (!channel.points.hasOwnProperty(user)) {
			channel.points[user] = 0;
		}
		channel.points[user] += 1;
		var scoreboard = '';
		var scores = [];
		for (var user in channel.points) {
			scores.push([channel.points[user], user]);
		}
		scores.sort();
		for (var i = 0; i < scores.length; i++) {
			scoreboard += '**' + scores[i][1] + '**: ' + scores[i][0] + '\n';
		}
		return scoreboard;
	}
	
	function tryAnswer(user, userAnswer, channel) {
		try {
			var answer = trivia[channel.category][channel.questionID][1];
			if (answer.toLowerCase() == userAnswer) {
				var scoreboard = scoreToUserAndReturnScoreboard(user, channel);
				channel.ev.channel.send('Congratulations, **' + user + '**!\n\n' + scoreboard + '\n\n' + returnNewQuestion(channel));
			} 
		} catch(err) {
			console.error(err);
		}
	}
	
	setInterval(function() {
		for (var channel in channels) {
			var tip = returnQuestionAndTip(channels[channel]);
			if (isTipComplete(channels[channel])) {
				channels[channel].ev.channel.send(tip + '\n\nNobody scored this round. :(\n\n' + returnNewQuestion(channels[channel]));
			} else {
				channels[channel].ev.channel.send(tip);
			}
		}
	}, 30000);

	return {
		start: function(category, ev) {
			if (channels.hasOwnProperty(ev.channel)) {
				stopTrivia(channels[ev.channel]);
			} else {
				var ids = [];
				for (var i = 0; i < trivia[category].length; i++) {
					ids.push(i);
				}
				shuffle(ids);
				channels[ev.channel] = {
					channel: ev.channel,
					category: category,
					points: { },
					ev: ev,
					questions: ids,
					questionIndex: 0
				};
				ev.channel.send('Trivia started. Use ***!a*** to answer a question. **Oink**!\n\n' + returnNewQuestion(channels[ev.channel]));
			}
		},
		stop: function(ev) {
			if (channels.hasOwnProperty(ev.channel)) {
				stopTrivia(channels[ev.channel]);
			}
		},
		answer: function(user, answerStr, ev) {
			if (channels.hasOwnProperty(ev.channel)) {
				tryAnswer(user, answerStr, channels[ev.channel]);
			}
		}
	};
	
};
