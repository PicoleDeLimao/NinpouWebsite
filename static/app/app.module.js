'use strict';

var app = angular.module('Ninpou', ['ngMaterial', 'ui.router']);

app.config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('pink')
		.accentPalette('deep-purple');
});