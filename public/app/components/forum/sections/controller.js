'use strict';

var app = angular.module('Ninpou');

app.controller('ForumSectionsCtrl', ['$scope', '$stateParams', '$http', '$mdPanel', 'Threads', 'StickyThreads', 'MongoService', 'SectionData',
function($scope, $stateParams, $http, $mdPanel, Threads, StickyThreads, MongoService, SectionData) {
	window.scrollTo(0,0);
	$scope.threads = Threads.threads;
	$scope.section = Threads.section;
	$scope.sectionsData = SectionData;
	$scope.sticky = StickyThreads;
	$scope.currentPage = 1;
	$scope.numDocsPerPage = 10;
	$scope.numPages = Math.ceil($scope.section.numThreads / $scope.numDocsPerPage);
	$scope.pages = [];
	for (var i = 1; i <= $scope.numPages; i++) {
		$scope.pages.push(i);
	}
	$scope.loadPage = function(page) {
		$http.get('/sections/' + $stateParams.section + '?page=' + (page - 1) + '&limit=' + $scope.numDocsPerPage)
		.then(function(response) {
			$scope.threads = response.data.threads;
			$scope.currentPage = page;
			$scope.numPages = Math.ceil(response.data.section.numThreads / $scope.numDocsPerPage);
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
	$scope.createNewThread = function() {
		var position = $mdPanel.newPanelPosition().absolute().center();
		var config = {
			attachTo: angular.element(document.body),
			controller: ['mdPanelRef', '$http', function(mdPanelRef, $http) {
				var ctrl = this;
				ctrl.createNewThread = function() {
					$http({
						method: 'POST',
						url: '/threads/' + $scope.section.name,
						data: {
							title: ctrl.title,
							contents: ctrl.contents
						}
					})
					.then(function(response) {
						mdPanelRef.close();
						$scope.loadPage(1);
					}, function(response) {

					});
				};
			}],
			controllerAs: 'ctrl',
			disableParentScroll: true,
			templateUrl: 'app/components/forum/sections/new-thread.html',
			hasBackdrop: true,
			position: position,
			trapFocus: true,
			zIndex: 9999,
			clickOutsideToClose: true,
			escapeToClose: true,
			focusOnOpen: true
		};
		$mdPanel.open(config);
	};
	$scope.timeAgo = function(time) {
		return moment(MongoService.oidToDate(time)).fromNow();
	};
}]);