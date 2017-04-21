'use strict';

var app = angular.module('Ninpou');

app.controller('ForumNewCtrl', ['$scope', '$http', 'Threads', 'NumThreadsPerPage', 'MongoService', 'SectionData',
function($scope, $http, Threads, NumThreadsPerPage, MongoService, SectionData) {
	window.scrollTo(0,0);
	
	$scope.threads = Threads.threads;
	$scope.sections = SectionData;
	$scope.currentPage = 1;
	$scope.numPages = Math.ceil(Threads.numThreads / NumThreadsPerPage);
	$scope.pages = [];
	for (var i = 1; i <= $scope.numPages; i++) {
		$scope.pages.push(i);
	}
	
	$scope.loadPage = function(page) {
		$http.get('/threads/new?page=' + (page - 1) + '&limit=' + NumThreadsPerPage)
		.then(function(response) {
			$scope.threads = response.data.threads;
			$scope.currentPage = page;
			$scope.numPages = Math.ceil(response.data.numThreads / NumThreadsPerPage);
			$scope.pages = [];
			for (var i = 1; i <= $scope.numPages; i++) {
				$scope.pages.push(i);
			}
			$scope.refreshing = false;
			$scope.refreshText = 'Refresh';
		}, function(response) {
			
		});
	};
	$scope.refreshText = 'Refresh';
	$scope.refresh = function() {
		$scope.refreshing = true;
		$scope.refreshText = 'Refreshing...';
		$scope.loadPage($scope.currentPage);
	};
	$scope.timeAgo = function(time) {
		if (!time) return;
		return moment(MongoService.oidToDate(time)).fromNow();
	};
}]);