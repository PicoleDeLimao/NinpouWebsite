'use restrict';

var app = angular.module('Ninpou');

app.controller('ProfileThreadsCtrl', ['$scope', '$http', '$stateParams', '$state', 'Threads', 'NumThreadsPerPage', 'MongoService', 'SectionData',
function($scope, $http, $stateParams, $state, Threads, NumThreadsPerPage, MongoService, SectionData) {
	$scope.threads = Threads.threads;
	$scope.sections = SectionData;
	$scope.currentPage = 1;
	if ($state.is('root.profile.threads')) {
		$scope.numPages = Math.min(10, Math.ceil(Threads.numThreads / NumThreadsPerPage));
	} else {
		$scope.numPages = Math.min(10, Math.ceil(Threads.numThreads / NumThreadsPerPage));
	}
	$scope.pages = [];
	for (var i = 1; i <= $scope.numPages; i++) {
		$scope.pages.push(i);
	}
	
	$scope.loadPage = function(page) {
		var url;
		if ($state.is('root.profile.threads')) {
			url = '/users/' + $stateParams.id + '/threads';
		} else {
			url = '/users/' + $stateParams.id + '/replies';
		}
		$http.get(url + '?page=' + (page - 1) + '&limit=' + NumThreadsPerPage)
		.then(function(response) {
			$scope.threads = response.data.threads;
			$scope.currentPage = page;
		}, function(response) {
			
		});
	};
	$scope.timeAgo = function(time) {
		if (!time) return;
		return moment(MongoService.oidToDate(time)).fromNow();
	};
}]);