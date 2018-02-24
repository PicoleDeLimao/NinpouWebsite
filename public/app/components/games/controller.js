'use strict';

var app = angular.module('Ninpou');

app.controller('GamesCtrl', ['$scope', '$http', '$interval', 'Games', function($scope, $http, $interval, Games) {
	$scope.games = Games;
	$scope.refresh = function() {
		$scope.refreshing = true; 
		$http.get('/games').success(function(data) {
			$scope.games = data;
			$scope.refreshing = false;
		});
	};
	$interval($scope.refresh, 30000);
	$scope.indices = function(arr, begin, end) {
		var newArr = [];
		for (var i = begin; i <= end; i++) {
			if (i < arr.length)
				newArr.push(arr[i]);
		}
		return newArr;
	};
	$scope.teams = [
	{
		name: 'Konohagakure',
		begin: 0,
		end: 2
	},
	{
		name: 'Otogakure',
		begin: 3,
		end: 5
	},
	{
		name: 'Akatsuki',
		begin: 6,
		end: 8
	}
	];
	$scope.show = function(game) {
		game.show = !game.show;
	};
}]);