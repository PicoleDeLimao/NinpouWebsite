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
		stat.chance = stat.chance || this.AgrestiCoullLower(stat.games, stat.wins);
		var score = stat.points * stat.gpm * stat.chance / 100;   
		if (isNaN(score)) return 0;  
		return score; 
	}

};
