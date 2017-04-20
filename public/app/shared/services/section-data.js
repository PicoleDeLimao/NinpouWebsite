'use strict';

var app = angular.module('Ninpou');

app.factory('SectionData', function() {
	return {
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
});