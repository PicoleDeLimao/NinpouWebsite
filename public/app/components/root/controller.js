'use strict';

var app = angular.module('Ninpou');

app.controller('RootCtrl', ['$scope', '$state', '$timeout', '$mdSidenav', function($scope, $state, $timeout, $mdSidenav) {
	$scope.goto = function(state) {
		if ($mdSidenav('left').isOpen()) {
			$scope.closeSidenav();
		}
		$scope.currentNavItem = state;
		$scope.menu = null;
		$state.go('root.' + state);
	};
	if ($state.current.name.split('.').length < 2) {
		$scope.goto('forum.home');
	} else {
		$scope.currentNavItem = $state.current.name.split('.')[1];
	}
	$scope.$watch(function() {
		return $state.current.name;
	}, function(newValue, oldValue) {
		var state = newValue.split('.')[1];
		$scope.currentNavItem = state;
	});
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
	$scope.toggleLeft = buildToggler('left');
	function buildToggler(componentId) {
		return function() {
			$mdSidenav(componentId).toggle();
		};
    }
	$scope.openSidenav = function() {
		$scope.toggleLeft();
	};
	$scope.closeSidenav = function() {
		$scope.toggleLeft();
	};
}]);