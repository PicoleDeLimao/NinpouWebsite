'use strict';

module.exports = {

	AgrestiCoullLower(n, k) {
		//float conf = 0.05;  // 95% confidence interval
		var kappa = 10;//2.24140273; // In general, kappa = ierfc(conf/2)*sqrt(2)
		var kest=k+Math.pow(kappa,2)/2;
		var nest=n+Math.pow(kappa,2);
		var pest=kest/nest;
		var radius=kappa*Math.sqrt(pest*(1-pest)/nest);
		return Math.max(0,pest-radius); // Lower bound
		// Upper bound is min(1,pest+radius)
	},

	calculateScore(stat) { 
		stat.chance = stat.chance || this.AgrestiCoullLower(stat.games, stat.wins);
		var score = (stat.kills / stat.games * 10 - stat.deaths / stat.games * 5 + stat.assists / stat.games * 2) * (stat.gpm * 100 / stat.games) * stat.chance;   
		if (isNaN(score)) return 0;  
		return score; 
	}

};
