'use strict';

var app = angular.module('Ninpou');

app.controller('ProfileCtrl', ['$scope', '$state', 'Profile', 'MongoService', function($scope, $state, Profile, MongoService) {
	$scope.profile = Profile;
	$scope.timeAgo = function(time) {
		if (!time) return;
		return moment(MongoService.oidToDate(time)).fromNow();
	};
	$scope.timeAgoDate = function(date) {
		if (!date) return;
		return moment(date).fromNow();
	};
	$scope.oidToDate = MongoService.oidToDate;
	$scope.$watch(function() {
		return $state.current.name;
	}, function(newValue, oldValue) {
		if ($state.is('root.profile.threads')) {
			$scope.selectedIndex = 1;
		} else if ($state.is('root.profile.replies')) {
			$scope.selectedIndex = 2;
		} else {
			$scope.selectedIndex = 0;
		}
	});
	$scope.$watch(function() {
		return $scope.selectedIndex;
	}, function(newValue, oldValue) {
		switch (newValue) {
			case 0:
				$state.go('root.profile.info');
				break;
			case 1:
				$state.go('root.profile.threads');
				break;
			case 2:
				$state.go('root.profile.replies');
				break;
		}
	});
}]);