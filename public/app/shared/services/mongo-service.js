'use strict';

var app = angular.module('Ninpou');

app.factory('MongoService', function() {
	var oidToDate = function(oid) {
		return new Date(parseInt(oid.substring(0, 8), 16) * 1000);
	};
	return {
		oidToDate: oidToDate,
		getLastThreadUpdate: function(thread) {
			if (thread.lastReply) {
				return {
					user: thread.lastReply.createdBy,
					date: oidToDate(thread.lastReply._id)
				};
			} else {
				return {
					user: thread.createdBy,
					date: oidToDate(thread._id)
				};
			}
		}
	};
});