var http = require('http');

module.exports = function(bot) {
		
	var trivia = {};
	trivia['naruto'] = [
		["Who was the first ninja to get hit by Naruto's RasenShuriken?", "Kakuzu"],
		["Which Hokage used Shuriken Clone Jutsu during a battle?", "Hiruzen"],
		["What does Naruto call Rock Lee?", "Bushybrow"],
		["Who is said to have copied over a 1000 jutsus?", "Kakashi"],
		["Who was the newest member to join the Akatsuki?", "Hidan"],
		["Who fought Pain to protect Naruto?", "Hinata"],
		["Who was the first ninja to get hit by rasengan from Naruto?", "Kabuto"],
		["Who stole Zabuza's sword?", "Suigetsu"],
        ["Who killed Neji?", "Obito"],
		["What is Yamato's real name?", "Tenzo"],
		["In what Manga chapter did we first see Naruto's kyuubi chakra leak out?", "Chapter 27"],
		["Who was the head of the Intelligence Division in the Fourth Great Ninja War?", "Inoichi"],
		["Who justified ending the life of a fellow Akatsuki member on the grounds of winning a battle?", "Deidara"],
		["In the Naruto manga, which jinchuuriki was the first to be captured?", "Gaara"],
		["Who was Naruto's teacher at the ninja academy?", "Iruka"],
		["Who had the Earth Curse Mark Seal?", "Kimimaro"],
		["What is the last hand sign for the Uchiha Clan's Fireball Jutsu?", "Tiger"],
		["Which ninja uses a Yin Seal?", "Tsunade"],
		["Which is Deidara's highest form of explosive clay?", "C0"],
		["Who proclaimed them self as 'The second sage of six paths'?", "Obito"],
		["Who is officially the Sixth Hokage at the end of the manga series?", "Kakashi"],
		["What village does Naruto belong to?", "Konohagakure"],
		["What is the name of the Biju inside Gaara?", "Shukaku"],
		["Who killed Danzo?", "Sasuke"],
		["Who was suggested as hokage while Tsunade was in a coma?", "Kakashi"],
		["From what village was the ninja who made Sakura cut her hair from?", "Sound"],
		["Who revived Gaara when the Biju was taken out of him?", "Chiyo"],
		["What's the name of Shizune's pet pig?", "Tonton"],
		["Where does Ino wear her ninja headband?", "Hip"],
		["Who has had amnesia when a child?", "Kabuto"],
		["Which country has the samurai?", "Land of Iron"],
		["Who is the second hokage of Konoha?", "Tobirama"],
		["Which Akatsuki member killed Asuma?", "Hidan"],
		["Which character posses two kekkei genkai?", "Mei"],
		["Who destroyed the boulder to get into the cave in the beginning of Shippuden?", "Sakura"],
		["Who used the Six Red Yang Formation during a battle?", "Obito"],
		["Who uses a magnet release?", "The Third Kazekage"],
		["Which Kirigakure ninja was killed by Kakashi?", "Haku"],
		["Who has the ability to record battles?", "Black Zetsu"],
		["Who was the first ninja Sasuke copied?", "Rock Lee"],
		["Who was the last ninja to control the nine-tailed fox before Naruto?", "Obito"],
		["What is the Aburame clan special ability?", "Bug manipulation"],
		["What is the Akimichi clan special ability?", "Body expansion"],
		["What is the Inuzuka clan special ability?", "Dogs"],
		["What is the Kaguya clan special ability?", "Bone manipulation"],
		["What is the Kamizuru clan special ability?", "Bee manipulation"],
		["Who was Madara once close friends with?", "Hashirama"]
		["Who removed the Shikifujin Seal on the Hokage?", "Orochimaru"],
		["Who became the Jinchuuriki of the Ten Tails?", "Obito"],
		["What does Gaara's forehead tattoo stand for?", "Love"],
		["Which clan is Karin a member of?", "Uzumaki"],
		["Where did the Uzumaki clan originate from?", "Land of Whirlpools"],
		['Who once said during a battle, "There is no such thing as peace. There is no such thing as hope."', "Obito"],
		["In the Naruto manga, which tailed beast showed up the least?", "Chomei"],
		["Who uses the Seven Swords Dance Technique?", "Killer Bee"],
		["Which ninja uses Kenjutsu?", "Hayate"],
		["What is name of the guy that made Naruto", "Masashi Kishimoto"],
		["Who came up with the village name Konohagakure?", "Madara"],
		["Who was nicknamed the Rabbit Goddess?", "Kaguya"],
		["Who is the only known Shinobi to have awakened rinnegan in both eyes?", "Madara"],
		["What clan did Nagato originate from?", "Uzumaki"],
		["Who invented the Edo Tensei jutsu?", "Tobirama"],
		["Where was the Gedō Mazō sealed away?", "The Moon"],
		["Who succesfully captured Roshi the 4 tails?", "Kisame"],
		["What clan was Haku from?", "Yuki"],
		["Under what mizukage was the mist village known as the blood mist village?", "The 4th Mizukage"],
		["When is Naruto's birthday?", "October 10th"],
		["What is Naruto's son called?", "Boruto"],
		["Who killed the second hokage Tobirama?", "Kinkaku"],
		["What is the original Tobi's nickname?", "Guruguru"],
		["Who trained under the great white snake at the ryuchi cave?", "Kabuto"],
		["Who is known as the child of prophecy?", "Naruto"],
		["Who was the main character in Jiraiya's novel Tales of a Gutsy Ninja?", "Naruto"],
		["Who gave Jiraiya & Orochimaru and Tsunade the title of Legendary Sannin?", "Hanzo"],
		["Which sword regenerates its own damage by blood?", "Kubikiribocho"],
		["Which was the last sword of the seven ninja swords men in kirigakures possession?", "Hiramekarei"],
		["Who was known as the Demon of the mist village?", "Zabuza"],
		["In what book can you find all the missin-nin?", "Bingo Book"],
		["Who was said to have mastered every single ninjutsu?", "Hiruzen"],
		["Who abandoned the Akatsuki organisation?", "Orochimaru"],
		["What is Deva Path Pains real name?", "Yahiko"],
		["Which clan has the ability to turn their bodies into liquid?", "Hozuki Clan"], 
		["What does Sarutobi stand for?", "monkey jump"],
		["What clan was overwhelmingly powerful in genjutsu?", "Kurama Clan"],
		["Which clan is known for their strong visual insight powers", "Hyuga Clan"],
		["What element is created by combinding water and earth?", "Wood release"],
		["What element is created by combinding wind and water?", "Ice release"],
		["What element is created by combinding fire and water?", "Boil release"],
		["What element is created by combinding fire and earth?", "Lava release"],
		["What element is created by combinding lightning and water?", "Storm release"],
		["What element is created by combinding earth & wind and fire?", "Dust release"],
		["What element is created by combinding wind and earth?", "Magnet release"],
		["What is the sharingans final stage?", "Rinnegan"],
		["Who was said to be the strongest Kazekage?", "The 3rd Kazekage"],
		["What shinobi learned developed a jutsu to bring a puppet or human back to life in exchange for the casters own life?", "Chiyo"],
        ["At what age did Itachi become an Anbu Captain?", "13"],
		["What is Might Gais fathers name?", "Might Duy"],
		["Who developed the Hiraishin no Jutsu?", "Tobirama"],
		["Who is the only other known shinobi from konoha able to use wood release besides Hashirama?", "Yamato"],
		["How many hearts was Kakuzu able to store up at the same time?", "5"],
		["What is Kakashi's primary ninja hound called?", "Pakkun"],
		["At what age did Kakashi become a Chunnin?", "6"],
		["at what age did Kakashi become a Jounin?", "12"],
		["Where does Katsuyu reside?", "Shikkotsu Forest"],
		["What is the name of the Great Toad Sage?", "Gamamaru"],
		["What is the consequence of using the 8th gate?", "Death"],
		["What is the name of Madara's father?", "Tajima Uchiha"],
		["What is the name of Hashirama's father?", "Butsuma Senju"],
		["Which ninja was renowned to have both the strongest shield and sword?", "The 3rd Raikage"],
		["From what village is Tazuna from?", "Land of Waves"],
		["What company was founded by Gato?", "Gato Company"],
        ["Who was said to have the ultimate defense?", "Gaara"],
		["What was the first jutsu we saw in the story?", "Clone Jutsu"],
		["What is the name of the boy who was able to control the 3 tails with his chakra?", "Yukimaru"],
		["What is the name of the only known user of the Crystal release?", "Guren"],
		["What is the name of the summoned animal known by the title of 'Monkey King'?", "Enma"],
		["What is the name of the ninja ostrich often appearing in filler episodes?", "Condor"],
		["What was the name of the country that Sasori destroyed with his puppet army?", "Land of This"],
		["What's the name of the drunken taijutsu fighting style?", "Drunken Fist"],
		["What's the Name of the ability very similiar to the drunken taijutsu style but used while fighting at sea?", "Seasickness Fist"],
		["The Exploding Human technique is an ability of what clan?", "Chinoike Clan"],
		["What is Tsunade's hobby?", "Gambling"],
		["Who besides Minato was a candidate to becoming the 4th Hokage?", "Orochimaru"],
		["What is the name of Tsunade's lover?", "Dan"],
		["What cult does Hidan practice?", "Jashin"],
		["A ninja's use of weaponry in combat is known as what?", "Bukijutsu"],
		["Who where the Twelve Guardian Ninja suppose to proctect?", "The Feudal Lord"],
		["Gengo was the leader of what country?", "Land Of Silence"],
		["Ninjutsu is also known as what?", "Ninshu"],
		["Who was the leader of the Orochimarus Sound Ninja Four when Kimimaro wasnt present?", "Sakon"],
		["Juinjutsu is also known as what?", "Curse Mark Jutsu"],
		["Abilities passed down through the blood is known as what?", "Kekkei Genkai"],
		["Abilities used through the power of your eyes is know as what?", "Dojutsu"],
		["A human who has a biju sealed inside is known as what?", "Jinchuriki"],
		["The first hidden village created was named?", "Hidden Leaf Village"],
		["What is the name of Hashirama's wife?", "Mito Uzumaki"],
		["The ability to grant life in exchange for your own is called what?", "Rinne Tensei no Jutsu"],
		["Nagato called his revived human puppets what?", "The Six Paths of Pain"],
		["Sasuke's curse seal is called what?", "Cursed Seal Of Heaven"],
		["What is Naruto's prime chakra nature?", "Wind"],
		["How many chakra natures does the truth seeking balls consist of?", "5"],
		["Kisame is from what village?", "Hidden Mist Village"],
		["Kakuzu is from what village?", "Hidden Waterfall Village"],
		["Hidan is from what village?", "Hidden Hot Water Village"],
		["Kagura is the grandson of who?", "Yagura"],
		["Who stopped Naruto from transforming into the nine tails when he fought Pain?", "Minato"],
		["From who is Orochimarus curse seal mark created from?", "Juugo"],
		["Who helped Naruto learn to control the nine tails?", "Killer Bee"],
		["Kidomaru & Sakon & Tayuya and Jirobo are known as what?", "The Sound Ninja Four"],
		["Kimimaro & Kidomaru & Sakon & Tayuya and Jirobo are known as what?", "The Sound Ninja Five"],
		["Who was in possession of the legendary weapon Sword Of Totsuka?", "Itachi"],
		["Who was in possession of the legendary shield Yata Mirror?", "Itachi"],
		["What color is Shisuis susanoo?", "Green"],
		["What color is Obitos susanoo?", "Light Blue"],
		["In the original Naruto there's an episode where Shino laughs which episode number is it?", "Episode 186"],
		["With who did Ino and Chouji take the Chūnin exams the second time?", "Sakura"],
		["Who is Narutos earliest rival?", "Konohamaru"],
		["What is Jiraiya also known as?", "The Toad Sage"],
		["What is Tsunade also known as?", "The Slug Princess"],
		["Fujin and Raijin are also known as?", "The Legendary Stupid Brothers"],
		["Who tricked Naruto into stealing the scroll of sealing?", "Mizuki"],
		["What sound ninja was killed by Gaara during the chunin exam arc?", "Dosu"],
		["How many times could Sasuke use Chidori in the original Naruto?", "2"],
		["What did Naruto transform Gamabunta into while he was fighting Gaara", "Nine Tails"],
		["Ibiki Morino is the head of what division?", "Konoha Torture and Interrogation Force"],
		["Ibiki Morinos brother is named what?", "Idate Morino"],
		["Idate Morino flead from the village hidden in the leaves and became a citizen of what land?", "Land Of Tea"],
		["The Wasabi Family resides in what land?", "Land Of Tea"],
		["The Four Celestial Symbols Men were from village?", "Takumi Village"],
		["What village is widely known for having skills in creating weapons?", "Takumi Village"],
		["Isaribi a citizen of the land of the sea was also known as?", "The Demon Of The Ocean"],
		["Who did Sasuke first use Lions barrage against?", "Yoroi"],
		["Who was the only person to pass the chunin exams in the original Naruto?", "Shikamaru"],
		["What is the name of Orochimarus son?", "Mitsuki"],
		["Kabuto was working as what for most of his life?", "A Spy"],
		["Hayate was killed by who?", "Baki"],
		["Kosuke Maruboshi was also known as?", "The Eternal Genin"],
		["The only weakness known to Guy is what?", "Sea Sickness"],
		["What was the name of the toad Danzo killed to prevent Naruto from coming back to Konoha?", "Kosuke"],
		["First Hokages Necklace was said to be worth?", "three mountains containing gold mines"],
		["A ninja who delivers post is known as what?", "Courier Ninja"],
		["Princess Fuku resembles who in the show?", "Ino"],
		["Ranmaru was a child from hidden mist village, assisting what ninja?", "Raiga"],
		["The first known location of an akatsuki hideout is in what land?", "Land of Rivers"],
		["The Hozuki castle is also known as what?", "Blood Prison"],
		["The Hozuki castle is located in what village?", "Village Hidden in the Grass"],
		["Kakashi is also known as?", "Kakashi of the Sharingan"],
		["Rin was killed by who?", "Kakashi"],
		["During the mission to destroy the Kannabi Bridge who was thought to be resulted as a casuality?", "Obito"],
		["Gantetsu was also known as the?", "Legendary Dark Shinobi"],
		["Ninja Art Money Style Jutsu was created by who?", "Kunihisa"],
		["Dan Kato is the uncle of who?", "Shizune"],
		["Nawaki is the younger brother of who?", "Tsunade"],
		["The insect known to be able to track any scent as far as possible?", "Bikochu Beetle"],
		["The Land of Sound is also known as?", "The Land Of Rice Fields"],
		["The Curse Mandala is a jutsu from what clan?", "Fuma Clan"],
		["Soap Bubble Ninjutsu is used by who?", "Utakata"],
		["The Rasengan was created base on what jutsu?", "Tailed Beast Bomb"],
		["Minato took how long to learn the Rasengan?", "3 years"],
		["Itachi specializes in what form of jutsu?", "Genjutsu"],
		["Shinobi is also known as?", "Ninja"],
		["Izumo usually teams up with who?", "Kotetsu"],
		["Who manipulated the uchiha stone tablet to further their own goals?", "Black Zetsu"],
		["Who created the uchiha stone tablet?", "Sage of Six Paths"],
		["What is the name of Hagoromo Otsutsuki also known as the sage of six paths brother?", "Hamura Otsutsuki"],
		["The Hyuga are descendants of who?", "Hamura Otsutsuki"],
		["The Senju clan are related to which clan?", "Uzumaki Clan"],
		["In what episode is Kakashis face revealed?", "Episode 469"],
		["Shinobi are people that do what?", "Endure"],
		["The first Tsuchikage was said to be a member of what clan?", "Kamizuru Clan"],
		["Genbu an island which is also known as what?", "Turtle Island"],
		["The place where its said you conquer your own hatred is called what?", "Waterfall of Truth"],
		["Madaras hideout after his battle with Hashirama is in what area?", "Mountains Graveyard"],
		["Danzos right eye was from what shinobi?", "Shisui"],
		["How many of the 8 inner gates is Lee able to open?", "6"],
		["Pains path when he summons the king of hell is also known as?", "Naraka Path"],
		["Pain path that allows him to enter and read minds is known as?", "Human Path"],
		["The highest level of fire release is what?", "Amaterasu"],
		["Who did Naruto end up fighting in the chunin exam preliminaries?", "Kiba"],
		["When is the true strength of a shinobi revealed?", "when protecting something precious"],
		["How many participants in the first chunin exams where from Konoha?", "72"],
		["The second stage of the chunin exams was monitored by?", "Anko"],
		["How many ninjas took part of the first chunin exams in the story?", "153"],
		["Sasori was named with what title?", "Sasori of the red sand"],
		["Who was the youngest member of Akatsuki?", "Deidara"],
		["Kakashis father is named what?", "Sakumo Hatake"],
		["Ichiraku Ramen is run by who?", "Teuchi"],
		["Teuchis daughter is named what?", "Ayame"],
		["The three colored pills are used by which clan?", "Akimichi Clan"],
		["Zaku is a shinobi from which village?", "Hidden Sound Village"],
		["Kanna is the current what of konoha?", "Master Carpenter"],
		["Genno is from the Heat Devil village and is known as the?", "Trap Master"],
		["Konan was killed by?", "Obito"],
		["In what battle is the first time we see Izanagi", "Danzo vs Sasuke"],
		["From where did Nagato get his Rinnegan?", "Madara"],
		["Who was responsible for Yahikos death", "Hanzo"],
		["Danzo founded what organization inside konoha?", "Foundation"],
		["What was Orochimaru obsessed with?", "mastering all jutsus"],
		["Who advocated for the inclusiveness of a medical ninja in each ninja platoon?", "Tsunade"],
		["The fifth Hokage was originally meant to be?", "Jiraiya"],
		["How did you graduate from the foundation?", "killing your companion"],
		["Who appointed Hiruzen the 3rd Hokage?", "Tobirama"],
		["What was Shikamarus IQ stated to be?", "Over 200"],
		["Temaris summoned animal is named what?", "Kamatari"],
		["The third great power of the mangekyou sharingan is what?", "Susano"],
		["Who always thinks things through too much and makes up overly exaggerated examples of situations?", "Omoi"],
		["Who resurrected Orochimaru?", "Sasuke"],
		["How many explosive tags did Konan use to try and kill Obito?", "600 billion"],
		["What jutsu did Orochimaru use against Naruto to supress the nine tails?", "Five Elements Seal"],
		["Neji was stated to have an even greater defense than Gaara by who?", "Tenten"],
		["Pakura was known to possess what kekkei genkai?", "Scorch release"],
		["Kurenai and Asumas daughter was named what?", "Mirai Sarutobi"],
		["Who tended to use fake smiles?", "Sai"],
		["Mangetsu Hozuki is the brother of who?", "Suigetsu"],
		["Chiriku was a ninja monk who also served as a?", "Guardian Ninja Twelve"],
	];
	
	trivia['ninpou'] = [
		['What is the price of Oil?', '2250'],
		['How much damage does Bomb deal?', '800'],
		['What is the price of Banshosen?', '3500'],
		['How much damage does Poison Pills deal per second?', '200'],
		['How much damage does Explosive Tag deal?', '1000'],
		['How many explosive tags does Explosive Tag Package contain?', '8'],
		['Which spirit provides armor reduction upon attack?', 'Spirit of Darkness'],
		['Which spirit provides genjutsu bonus?', 'Spirit of Water'],
		['Which spirit provides a chance to stun on each attack?', 'Spirit of Earth'],
		['How much tai does Spirit of Earth provide?', '20'],
		['How much damage does Spirit of Fire provide?', '40'],
		['How much does Badge of ANBU cost?', '2000'],
		['How much does ANBU Mask cost at total?', '5300'],
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
		['What\'s the classification of Shield of the Sun?', 'Support'],
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
		['How much does Substitution Wood cost?', '2250'],
		['What is the cooldown of Substitution Wood active spell?', '15s'],
		['How much health does each charge of Sushi recover?', '150'],
		['What is the cooldown of Yata Mirror active spell?', '40s'],
		['What effect Yata Mirror provides to the target?', 'invulnerability'],
		['What Heaven Sword active spell (Divine Punish) does?', 'Halve genjutsu and ninjutsu'],
		['How many stats does Eight-headed Serpent provide?', '150'],
		['How many health points does Eight-headed Serpent provide?', '2000'],
		['How much armor does Eight-headed Serpent provide?', '30'],
		['What is the chance to deal critical damage with Eight-headed Serpent?', '15%'],
		['What is the damage of Eight-headed Serpent critical?', '3 x all stats'],
		['How much health does Eight-headed Serpent passive recover?', '5%'],
		['How much damage does Kyuubi\'s Lost Spear provide?', '180'],
		['How much taijutsu does Kyuubi\'s Lost Spear provide?', '120'],
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
		['What is the cost of Gunbai?', '2250'],
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
		['How much does Sword of Totsuka cost in gold?', '16000'],
		['How many crystals does Sword of Totsuka require?', '6'],
		['What is the cooldown of Sword of Totsuka active spell?', '40s'],
		['How much does Sword of Kusanagi cost?', '6000'],
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
		['Which spell hotkey allow Chouji to grow?', 'W'],
		['What character has his own dimension in the game?', 'Obito'],
		['What is Kakuzu\'s main attribute?', 'Taijutsu'],
		['What is the cooldown on Itachis R', '40 seconds'],
		['What item prevents healing in the game?', 'Executioners Blade'],
		['What is Nagatos main attribute?', 'Genjutsu'],
		['What does the A rank mission give?', 'Sannin Cloth'],
		['What does the S rank mission give?', 'Rikudou Staff'],
		['What does killing the 7 8 and 9 tails give?', '30 taijutsu'],
		['What does killing the 4 5 and 6 tails give?', '30 ninjutsu'],
		['What does killing the 1 2 and 3 tails give?', '30 genjutsu'],
		['How many stacks of base repair exist?', '10'],
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
				channel.ev.channel.send('Congratulations, **' + user.name + '**!\n\n' + scoreboard + '\n\n' + returnNewQuestion(channel));
				var request = http.request({ host: '127.0.0.1', port: (process.env.PORT || 8080), path: '/trivias/' + user.id, method: 'POST', 
					headers: { 'Content-Type': 'application/json', 'Content-Length': '0' } }, function(res) {
					var body = '';
					res.on('data', function(chunk) {
						body += chunk;
					});
					res.on('end', function() {
						if (res.statusCode != 200) { 
							try {
								data = JSON.parse(body);
								ev.channel.send(data.error);
							} catch (err) {
								ev.channel.send('Error on trivia. :( **Oink!** :pig:');
							}
						}
					});
				});
				request.on('error', function(err) {
					console.error(err);
					ev.channel.send('Error on trivia. :( **Oink!** :pig:');
				});
				request.end();
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
				ev.channel.send('Trivia started. Use ***!t*** to answer a question. **Oink**!\n\n' + returnNewQuestion(channels[ev.channel]));
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
