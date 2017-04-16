'use strict';

var app = angular.module('Ninpou');

app.controller('RootCtrl', function($scope, $state, $timeout) {
	$scope.goto = function(state) {
		$scope.currentNavItem = state;
		$scope.wc3MenuActive = false;
		$scope.dota2MenuActive = false;
		$state.go('root.' + state);
	};
	if ($state.current.name.split('.').length < 2) {
		$scope.goto('home');
	} else {
		$scope.currentNavItem = $state.current.name.split('.')[1];
	}
	$scope.showWC3Menu = function() {
		$scope.wc3MenuActive = true;
		$scope.dota2MenuActive = false;
	};
	$scope.showDota2Menu = function() {
		$scope.wc3MenuActive = false;
		$scope.dota2MenuActive = true;
	};
	$scope.go = function(state) {
		$state.go(state);
		$timeout(function() {
			$scope.wc3MenuActive = false;
			$scope.dota2MenuActive = false;
		});
	};
});