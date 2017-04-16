'use strict';

app.config(['$stateProvider', function($stateProvider) {
	var rootState = {
		name: 'root',
		url: '',
		controller: 'RootCtrl',
		templateUrl: 'app/components/root/view.html',
		resolve: {
			user: ['$q', '$http', '$rootScope', '$location', function($q, $http, $rootScope, $location) {
				var deferred = $q.defer();
				if ($location.search().token) {
					localStorage.setItem('token', $location.search().token);
					window.location.href = '/';
				}
				$http.get('/users/me').then(function(response) {
					$rootScope.user = response.data;
					deferred.resolve();
				}, function() {
					deferred.resolve();
				});
				return deferred.promise;
			}]
		}
	};
	var homeState = {
		name: 'root.home',
		url: '/home',
		controller: 'HomeCtrl',
		templateUrl: 'app/components/home/view.html'
	};
	var blogState = {
		name: 'root.blog',
		url: '/blog',
		controller: 'BlogCtrl',
		templateUrl: 'app/components/blog/view.html'
	};
	var wc3State = {
		name: 'root.wc3',
		url: '/wc3',
		abstract: true
	};
	var wc3HeroesState = {
		name: 'root.wc3.heroes',
		url: '/heroes',
		controller: 'WC3HeroesCtrl',
		templateUrl: 'app/components/wc3/heroes/view.html'
	};
	var wc3ItemsState = {
		name: 'root.wc3.items',
		url: '/items',
		controller: 'WC3ItemsCtrl',
		templateUrl: 'app/components/wc3/items/view.html'
	};
	var dota2State = {
		name: 'root.dota2',
		url: '/dota2',
		abstract: true
	};
	var dota2HeroesState = {
		name: 'root.dota2.heroes',
		url: '/heroes',
		controller: 'Dota2HeroesCtrl',
		templateUrl: 'app/components/dota2/heroes/view.html'
	};
	var dota2ItemsState = {
		name: 'root.dota2.items',
		url: '/items',
		controller: 'Dota2ItemsCtrl',
		templateUrl: 'app/components/dota2/items/view.html'
	};
	var forumState = {
		name: 'root.forum',
		url: '/forum',
		controller: 'ForumCtrl',
		templateUrl: 'app/components/forum/root/view.html'
	};
	var logoutState = {
		name: 'logout',
		url: '/logout',
		controller: function() {
			localStorage.clear();
			window.location.href = '/';
		}
	};
	$stateProvider.state(rootState);
	$stateProvider.state(homeState);
	$stateProvider.state(blogState);
	$stateProvider.state(wc3State);
	$stateProvider.state(wc3HeroesState);
	$stateProvider.state(wc3ItemsState);
	$stateProvider.state(dota2State);
	$stateProvider.state(dota2HeroesState);
	$stateProvider.state(dota2ItemsState);
	$stateProvider.state(forumState);
	$stateProvider.state(logoutState);
}]);