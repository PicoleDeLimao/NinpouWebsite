'use strict';

var app = angular.module('Ninpou');

app.controller('ForumSectionsCtrl', ['$scope', '$stateParams', '$http', '$mdPanel', 'Threads', 'StickyThreads', 'MongoService', 
function($scope, $stateParams, $http, $mdPanel, Threads, StickyThreads, MongoService) {
	$scope.threads = Threads.threads;
	$scope.section = Threads.section;
	$scope.sticky = StickyThreads;
	$scope.currentPage = 1;
	$scope.numDocsPerPage = 10;
	$scope.numPages = Math.ceil($scope.section.numThreads / $scope.numDocsPerPage);
	$scope.pages = [];
	for (var i = 1; i <= $scope.numPages; i++) {
		$scope.pages.push(i);
	}
	$scope.sectionsData = {
		announcements: {
			name: 'announcements',
			title: 'Announcements',
			description: 'Discuss the latest news and updates from Ninpou Community.',
			url: 'root.forum.sections({ section: "announcements" })',
			icon: 'assets/img/forum-section-announcements.png'
		},
		general: {
			name: 'general',
			title: 'General discussion',
			description: 'Talk about everything else not covered by other sections.',
			url: 'root.forum.sections({ section: "general" })',
			icon: 'assets/img/forum-section-general.png'
		},
		wc3_suggestions: {
			name: 'wc3_suggestions',
			title: 'Suggestions',
			description: 'Want to suggest something to improve the game? You\'re welcome here!',
			url: 'root.forum.sections({ section: "wc3_suggestions" })',
			icon: 'assets/img/forum-section-suggestions.png'
		},
		wc3_reports: {
			name: 'wc3_reports',
			title: 'Bug report',
			description: 'Found a bug? Report it here with as much detail as possible.',
			url: 'root.forum.sections({ section: "wc3_reports" })',
			icon: 'assets/img/forum-section-report.png'
		},
		wc3_tips: {
			name: 'wc3_tips',
			title: 'Tips and strategies',
			description: 'Got a strategy and want to share it? Post it here and help new players!',
			url: 'root.forum.sections({ section: "wc3_tips" })',
			icon: 'assets/img/forum-section-tips.png'
		},
		dota2_suggestions: {
			name: 'dota2_suggestions',
			title: 'Suggestions',
			description: 'Want to suggest something to improve the game? You\'re welcome here!',
			url: 'root.forum.sections({ section: "dota2_suggestions" })',
			icon: 'assets/img/forum-section-suggestions.png'
		},
		dota2_reports: {
			name: 'dota2_reports',
			title: 'Bug report',
			description: 'Found a bug? Report it here with as much detail as possible.',
			url: 'root.forum.sections({ section: "dota2_reports" })',
			icon: 'assets/img/forum-section-report.png'
		},
		dota2_tips: {
			name: 'dota2_tips',
			title: 'Tips and strategies',
			description: 'Got a strategy and want to share it? Post it here and help new players!',
			url: 'root.forum.sections({ section: "dota2_tips" })',
			icon: 'assets/img/forum-section-tips.png'
		}
	};
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