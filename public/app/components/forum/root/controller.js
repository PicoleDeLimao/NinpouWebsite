'use strict';

var app = angular.module('Ninpou');

app.controller('ForumCtrl', ['$scope', '$state', function($scope, $state) {
	if ($state.is('root.forum')) {
		$state.go('root.forum.home');
	}
}]);