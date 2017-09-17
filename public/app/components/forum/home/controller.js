'use strict';

var app = angular.module('Ninpou');

app.controller('ForumHomeCtrl', ['$scope', '$http', 'CategoriesData', 'Stats', 'MongoService', 'SectionData',
function($scope, $http, CategoriesData, Stats, MongoService, SectionData) {
	window.scrollTo(0,0);
	$scope.categoriesData = CategoriesData;
	$scope.stats = Stats;
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
	$scope.sectionData = SectionData;
	$scope.categories = [
	{
		name: 'COMMUNITY',
		icon: 'assets/img/forum-community-icon.png',
		sections: ['announcements', 'general']
	},
	/*{
		name: 'DOTA 2',
		icon: 'assets/img/forum-dota2-icon.png',
		sections: ['dota2_suggestions', 'dota2_reports', 'dota2_tips']
	},*/
	{
		name: 'WARCRAFT 3',
		icon: 'assets/img/forum-wc3-icon.png',
		sections: ['wc3_suggestions', 'wc3_reports', 'wc3_tips']
	}
	];
	$scope.getData = function(sectionName) {
		return $scope.categoriesData[sectionName];
	};
	$scope.getLastUpdate = function(sectionName) {
		var thread = $scope.categoriesData[sectionName].lastThread;
		return {
			user: thread.lastUpdate.updatedBy,
			date: MongoService.oidToDate(thread.lastUpdate._id)
		};
	};
	$scope.timeAgo = function(time) {
		return moment(time).fromNow();
	};
}]);