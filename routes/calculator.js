'use strict';

module.exports = {

	AgrestiCoullLower(n, k) {
		//float conf = 0.05;  // 95% confidence interval
		var kappa = 3;//2.24140273; // In general, kappa = ierfc(conf/2)*sqrt(2)
		var kest=k+Math.pow(kappa,2)/2;
		var nest=n+Math.pow(kappa,2);
		var pest=kest/nest;
		var radius=kappa*Math.sqrt(pest*(1-pest)/nest);
		return Math.max(0,pest-radius); // Lower bound
		// Upper bound is min(1,pest+radius)
	},

	calculateScore(stat) {
		stat.chance = stat.chance || this.AgrestiCoullLower(stat.gamesRanked, stat.wins);
		var score = stat.points * stat.chance;   
		if (isNaN(score)) return 0;
		return score; 
	},

	calculateScoreReadjusted(stat) {
		stat.chance = stat.chance || this.AgrestiCoullLower(stat.gamesRanked, stat.wins);
		var score = stat.points * stat.chance; 
		var numberOfElapsesDays;
		if (stat.lastRankedGame) {
			numberOfElapsesDays = Math.abs(new Date() - stat.lastRankedGame) / (24 * 60 * 60 * 1000);
		} else {
			numberOfElapsesDays = 360;
		}
		if (numberOfElapsesDays > 10 && score > 0) {
			score = score * Math.log(Math.min(numberOfElapsesDays, 30)) / Math.log(2.0) / 10.0;
		}
		if (isNaN(score)) return 0;
		return score;
	}

};
