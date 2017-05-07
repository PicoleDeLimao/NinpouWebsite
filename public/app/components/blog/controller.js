'use strict';

var app = angular.module('Ninpou');

app.controller('BlogCtrl', ['$scope', '$http', 'Posts', 'NumThreadsPerPage', function($scope, $http, Posts, NumThreadsPerPage) {
	$scope.posts = Posts.threads;
	$scope.numPages = Math.ceil(Posts.section.numThreads / NumThreadsPerPage);
	$scope.page = 1;
	$scope.getDate = function(id) {
		return new Date(parseInt(id.substring(0, 8), 16) * 1000);
	};
	$scope.limit = function(text) {
		if (text.length > 500) {
			return text.substr(0, 500) + '...';
		} else {
			return text;
		}
	};
	$scope.readMore = function(text) {
		return text.length > 500;
	};
	$scope.previousPage = function() {
		$http.get('/sections/announcements?limit=' + NumThreadsPerPage + '&page=' + $scope.page)
		.then(function(response) {
			$scope.posts = response.data.threads;
			$scope.page++;
		}, function(response) {
			
		});
	};
	$scope.nextPage = function() {
		$http.get('/sections/announcements?limit=' + NumThreadsPerPage + '&page=' + ($scope.page - 2))
		.then(function(response) {
			console.log(response.data);
			$scope.posts = response.data.threads;
			$scope.page--;
		}, function(response) {
			
		});
	};
}]);