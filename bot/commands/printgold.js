'use strict';

module.exports = function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}