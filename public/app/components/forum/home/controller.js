'use strict';

var app = angular.module('Ninpou');

app.controller('ForumHomeCtrl', ['$scope', '$http', 'CategoriesData', 'MongoService', 
function($scope, $http, CategoriesData, MongoService) {
	$scope.categoriesData = CategoriesData;
	$scope.refreshText = 'Refresh';
	$scope.refresh = function() {
		$scope.refreshText = 'Refreshing...';
		$scope.refreshing = true;
		$http.get('/sections')
		.then(function(response) {
			$scope.refreshText = 'Refresh';
			$scope.categoriesData = response.data;
			$scope.refreshing = false;
		}, function(response) {
		});
	};
	$scope.categories = [
	{
		name: 'COMMUNITY',
		icon: 'assets/img/forum-community-icon.png',
		sections: [
		{
			name: 'announcements',
			title: 'Announcements',
			description: 'Discuss the latest news and updates from Ninpou Community.',
			url: '#/forum/sections/announcements',
			icon: 'assets/img/forum-section-announcements.png'
		},
		{
			name: 'general',
			title: 'General discussion',
			description: 'Talk about everything else not covered by other sections.',
			url: '#/forum/sections/general',
			icon: 'assets/img/forum-section-general.png'
		}
		]
	},
	{
		name: 'WARCRAFT 3',
		icon: 'assets/img/forum-wc3-icon.png',
		sections: [
		{
			name: 'wc3_suggestions',
			title: 'Suggestions',
			description: 'Want to suggest something to improve the game? You\'re welcome here!',
			url: '#/forum/sections/wc3/suggestions',
			icon: 'assets/img/forum-section-suggestions.png'
		},
		{
			name: 'wc3_reports',
			title: 'Bug report',
			description: 'Found a bug? Report it here with as much detail as possible.',
			url: '#/forum/sections/wc3/report',
			icon: 'assets/img/forum-section-report.png'
		},
		{
			name: 'wc3_tips',
			title: 'Tips and strategies',
			description: 'Got a strategy and want to share it? Post it here and help new players!',
			url: '#/forum/sections/wc3/tips',
			icon: 'assets/img/forum-section-tips.png'
		}
		]
	},
	{
		name: 'DOTA 2',
		icon: 'assets/img/forum-dota2-icon.png',
		sections: [
		{
			name: 'dota2_suggestions',
			title: 'Suggestions',
			description: 'Want to suggest something to improve the game? You\'re welcome here!',
			url: '#/forum/sections/dota2/suggestions',
			icon: 'assets/img/forum-section-suggestions.png'
		},
		{
			name: 'dota2_reports',
			title: 'Bug report',
			description: 'Found a bug? Report it here with as much detail as possible.',
			url: '#/forum/sections/dota2/report',
			icon: 'assets/img/forum-section-report.png'
		},
		{
			name: 'dota2_tips',
			title: 'Tips and strategies',
			description: 'Got a strategy and want to share it? Post it here and help new players!',
			url: '#/forum/sections/dota2/tips',
			icon: 'assets/img/forum-section-tips.png'
		}
		]
	}
	];
	$scope.getData = function(sectionName) {
		return $scope.categoriesData[sectionName];
	};
	$scope.getLastUpdate = function(sectionName) {
		var data = $scope.categoriesData[sectionName];
		return MongoService.getLastThreadUpdate(data.lastThread);
	};
	$scope.timeAgo = function(time) {
		return moment(time).fromNow();
	};
}]);