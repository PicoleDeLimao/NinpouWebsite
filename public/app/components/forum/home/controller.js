'use strict';

var app = angular.module('Ninpou');

app.controller('ForumHomeCtrl', ['$scope', function($scope) {
	$scope.categories = [
	{
		name: 'COMMUNITY',
		icon: 'assets/img/forum-community-icon.png',
		sections: [
		{
			title: 'Announcements',
			description: 'Discuss the latest news and updates from Ninpou Community.',
			url: '#/forum/section/announcements',
			icon: 'assets/img/forum-section-announcements.png'
		},
		{
			title: 'General discussion',
			description: 'Talk about everything else not covered by other sections.',
			url: '#/forum/section/general',
			icon: 'assets/img/forum-section-general.png'
		}
		]
	},
	{
		name: 'WARCRAFT 3',
		icon: 'assets/img/forum-wc3-icon.png',
		sections: [
		{
			title: 'Suggestions',
			description: 'Want to suggest something to improve the game? You\'re welcome here!',
			url: '#/forum/section/wc3/suggestions',
			icon: 'assets/img/forum-section-suggestions.png'
		},
		{
			title: 'Bug report',
			description: 'Found a bug? Report it here with as much detail as possible.',
			url: '#/forum/section/wc3/report',
			icon: 'assets/img/forum-section-report.png'
		},
		{
			title: 'Tips and strategies',
			description: 'Got a strategy and want to share it? Post it here and help new players!',
			url: '#/forum/section/wc3/tips',
			icon: 'assets/img/forum-section-tips.png'
		}
		]
	},
	{
		name: 'DOTA 2',
		icon: 'assets/img/forum-dota2-icon.png',
		sections: [
		{
			title: 'Suggestions',
			description: 'Want to suggest something to improve the game? You\'re welcome here!',
			url: '#/forum/section/dota2/suggestions',
			icon: 'assets/img/forum-section-suggestions.png'
		},
		{
			title: 'Bug report',
			description: 'Found a bug? Report it here with as much detail as possible.',
			url: '#/forum/section/dota2/report',
			icon: 'assets/img/forum-section-report.png'
		},
		{
			title: 'Tips and strategies',
			description: 'Got a strategy and want to share it? Post it here and help new players!',
			url: '#/forum/section/dota2/tips',
			icon: 'assets/img/forum-section-tips.png'
		}
		]
	}
	];
}]);