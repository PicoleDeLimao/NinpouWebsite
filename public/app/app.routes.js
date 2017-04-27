'use strict';

app.config(['$stateProvider', function($stateProvider) {
	var rootState = {
		name: 'root',
		url: '',
		controller: 'RootCtrl',
		templateUrl: 'app/components/root/view.html',
		resolve: {
			user: ['$q', '$http', '$rootScope', function($q, $http, $rootScope) {
				var deferred = $q.defer();
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
	var loginState = {
		name: 'login',
		url: '/login',
		controller: ['$location', function($location) {
			if ($location.search().token) {
				localStorage.setItem('token', $location.search().token);
				window.location.href = '/#/forum/home';
			}
		}]
	};
	var logoutState = {
		name: 'logout',
		url: '/logout',
		controller: function() {
			localStorage.clear();
			window.location.href = '/';
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
	var profileState = {
		name: 'root.profile',
		url: '/profile/:id',
		controller: 'ProfileCtrl',
		templateUrl: 'app/components/profile/view.html',
		resolve: {
			Profile: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
				var deferred = $q.defer();
				$http.get('/users/' + $stateParams.id)
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
	};
	var profileInfoState = {
		name: 'root.profile.info',
		url: '/info',
		controller: 'ProfileInfoCtrl',
		templateUrl: 'app/components/profile/info/view.html'
	};
	var profileThreadsState = {
		name: 'root.profile.threads',
		url: '/threads',
		controller: 'ProfileThreadsCtrl',
		templateUrl: 'app/components/profile/threads/view.html',
		resolve: {
			Threads: ['$q', '$http', '$stateParams', 'NumThreadsPerPage', function($q, $http, $stateParams, NumThreadsPerPage) {
				var deferred = $q.defer();
				$http.get('/users/' + $stateParams.id + '/threads?limit=' + NumThreadsPerPage)
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
	};
	var profileRepliesState = {
		name: 'root.profile.replies',
		url: '/replies',
		controller: 'ProfileThreadsCtrl',
		templateUrl: 'app/components/profile/threads/view.html',
		resolve: {
			Threads: ['$q', '$http', '$stateParams', 'NumThreadsPerPage', function($q, $http, $stateParams, NumThreadsPerPage) {
				var deferred = $q.defer();
				$http.get('/users/' + $stateParams.id + '/replies?limit=' + NumThreadsPerPage)
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
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
		templateUrl: 'app/components/forum/root/view.html',
		abstract: true
	};
	var forumHomeState = {
		name: 'root.forum.home',
		url: '/home',
		controller: 'ForumHomeCtrl',
		templateUrl: 'app/components/forum/home/view.html',
		resolve: {
			CategoriesData: ['$q', '$http', function($q, $http) {
				var deferred = $q.defer();
				$http.get('/sections')
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}],
			Stats: ['$q', '$http', function($q, $http) {
				var deferred = $q.defer();
				$http.get('/forum/stats')
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
	};
	var forumSectionsState = {
		name: 'root.forum.sections',
		url: '/sections/:section',
		controller: 'ForumSectionsCtrl',
		templateUrl: 'app/components/forum/sections/view.html',
		resolve: {
			Threads: ['$q', '$http', '$stateParams', 'NumThreadsPerPage', function($q, $http, $stateParams, NumThreadsPerPage) {
				var deferred = $q.defer();
				$http.get('/sections/' + $stateParams.section + '?limit=' + NumThreadsPerPage)
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}],
			StickyThreads: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
				var deferred = $q.defer();
				$http.get('/sections/' + $stateParams.section + '/sticky')
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
	};
	var forumThreadsState = {
		name: 'root.forum.threads',
		url: '/threads/:id',
		controller: 'ForumThreadsCtrl',
		controllerAs: 'ctrl',
		templateUrl: 'app/components/forum/threads/view.html',
		resolve: {
			Thread: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
				var deferred = $q.defer();
				$http.get('/threads/' + $stateParams.id)
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
	};
	var forumNewState = {
		name: 'root.forum.new',
		url: '/new',
		controller: 'ForumNewCtrl',
		templateUrl: 'app/components/forum/new/view.html',
		resolve: {
			Threads: ['$q', '$http', 'NumThreadsPerPage', function($q, $http, NumThreadsPerPage) {
				var deferred = $q.defer();
				$http.get('/threads/new?limit=' + NumThreadsPerPage)
				.then(function(response) {
					deferred.resolve(response.data);
				}, function(response) {
					deferred.reject(response.data);
				});
				return deferred.promise;
			}]
		}
	};
	$stateProvider.state(rootState);
	$stateProvider.state(loginState);
	$stateProvider.state(logoutState);
	$stateProvider.state(homeState);
	$stateProvider.state(blogState);
	$stateProvider.state(profileState);
	$stateProvider.state(profileInfoState);
	$stateProvider.state(profileThreadsState);
	$stateProvider.state(profileRepliesState);
	$stateProvider.state(wc3State);
	$stateProvider.state(wc3HeroesState);
	$stateProvider.state(wc3ItemsState);
	$stateProvider.state(dota2State);
	$stateProvider.state(dota2HeroesState);
	$stateProvider.state(dota2ItemsState);
	$stateProvider.state(forumState);
	$stateProvider.state(forumHomeState);
	$stateProvider.state(forumSectionsState);
	$stateProvider.state(forumThreadsState);
	$stateProvider.state(forumNewState);
}]);