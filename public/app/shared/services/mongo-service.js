'use strict';

var app = angular.module('Ninpou');

app.factory('MongoService', function() {
	return {
		oidToDate: function(oid) {
			return new Date(parseInt(oid.substring(0, 8), 16) * 1000);
		}
	};
});