'use strict';

var app = angular.module('Ninpou');

app.controller('RootCtrl', ['$scope', '$state', '$timeout', function($scope, $state, $timeout) {
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
		if ($scope.menu == menu) {
			$scope.menu = null;
		} else {
			$scope.menu = menu;
		}
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