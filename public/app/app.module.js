'use strict';

var app = angular.module('Ninpou', ['ngMaterial', 'ngAnimate', 'ui.router', 'angularMoment', 'bbModule']);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('pink')
		.accentPalette('deep-purple');
}]);

// Token interceptor
app.factory('httpTokenInterceptor', ['$q', '$timeout', function($q, $timeout) {
	return {
		request: function(config) {
			if (localStorage.getItem('token')) {
				config.headers['Authorization'] = 'JWT ' + localStorage.getItem('token');
			}
			return config;
		},
		responseError: function(response) {
			if (response.status == 401 || response.status == 403) {
				localStorage.clear();
			}
			return $q.reject(response);
		}
	};
}]);

app.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('httpTokenInterceptor');
}]);