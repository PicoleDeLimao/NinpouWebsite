'use strict';

var app = angular.module('Ninpou');

app.controller('RootCtrl', ['$scope', '$state', '$timeout', '$location', function($scope, $state, $timeout, $location) {
	if ($location.search().token) {
		localStorage.setItem('token', $location.search().token);
		window.location.href = '/';
	}
	$scope.goto = function(state) {
		$scope.currentNavItem = state;
		$scope.menu = null;
		$state.go('root.' + state);
	};
	if ($state.current.name.split('.').length < 2) {
		$scope.goto('home');
	} else {
		$scope.currentNavItem = $state.current.name.split('.')[1];
	}
	$scope.setMenu = function(menu) {
		$scope.menu = menu;
	};
	$scope.isMenu = function(menu) {
		return $scope.menu == menu;
	};
	$scope.go = function(state) {
		$state.go(state);
		$timeout(function() {
			$scope.menu = '';
		});
	};
}]);