'use strict';

var app = angular.module('Ninpou');

app.controller('StatsCtrl', ['$scope', '$http', 'MongoService', 'Games', function($scope, $http, MongoService, Games) {
	$scope.games = Games;
	console.log($scope.games);
	$scope.getData = function(_id) {
		return MongoService.oidToDate(_id);
	};
	$scope.timeAgo = function(time) {
		return moment(time).fromNow();
	};
}]);
