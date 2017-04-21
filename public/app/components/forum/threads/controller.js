'use strict';

var app = angular.module('Ninpou');

app.controller('ForumThreadsCtrl', ['$scope', '$stateParams', '$state', '$http', '$timeout', '$mdDialog', 'Thread', 'MongoService', 'SectionData', 'NumRepliesPerPage',
function($scope, $stateParams, $state, $http, $timeout, $mdDialog, Thread, MongoService, SectionData, NumRepliesPerPage) {
	var ctrl = this;
	window.scrollTo(0,0);
	
	$scope.thread = Thread;
	$scope.sectionData = SectionData;
	$scope.currentPage = 1;
	$scope.replies = $scope.thread.replies.slice(0, NumRepliesPerPage);
	$scope.numPages = Math.ceil($scope.thread.replies.length / NumRepliesPerPage);
	$scope.pages = [];
	for (var i = 1; i <= $scope.numPages; i++) {
		$scope.pages.push(i);
	}
	
	$scope.sendReply = function(id) {
		var el = document.getElementById(id);
		$http({
			method: 'POST',
			url: '/threads/' + $stateParams.id + '/replies',
			data: {
				contents: ctrl.replyContents
			}
		})
		.then(function(response) {
			ctrl.replyContents = '';
			$scope.reloadReplies();
		}, function(response) {
			console.log(response);
		});
	};
	
	$scope.loadReplies = function(page) {
		$scope.currentPage = page;
		$scope.replies = $scope.thread.replies.slice((page - 1) * NumRepliesPerPage, page * NumRepliesPerPage);
		$timeout(function() {
			document.getElementById('reply-start').scrollIntoView();
		});
	};
	$scope.reloadReplies = function(gotoFirstPage) {
		$http.get('/threads/' + $stateParams.id + '/replies')
		.then(function(response) {
			$scope.thread.replies = response.data;
			$scope.numPages = Math.ceil($scope.thread.replies.length / NumRepliesPerPage);
			$scope.pages = [];
			for (var i = 1; i <= $scope.numPages; i++) {
				$scope.pages.push(i);
			}
			if (gotoFirstPage) {
				$scope.loadReplies(1);
			} else {
				$scope.loadReplies($scope.numPages);
			}
			$timeout(function() {
				if (gotoFirstPage) {
					window.scrollTo(0, 0);
				} else {
					window.scrollTo(0, document.body.scrollHeight);
				}
			});
		}, function(response) {
			
		});
	};
	$scope.timeAgo = function(time) {
		if (!time) return;
		return moment(MongoService.oidToDate(time)).fromNow();
	};
	$scope.saveThread = function() {
		$http({
			method: 'PUT',
			url: '/threads/' + $stateParams.id,
			data: {
				title: ctrl.threadTitle,
				contents: ctrl.threadContents
			}
		})
		.then(function(response) {
			$scope.thread.title = ctrl.threadTitle;
			$scope.thread.contents = ctrl.threadContents;
			ctrl.editThread = false;
		}, function(response) {
			
		});
	}
	$scope.saveReply = function(reply) {
		$http({
			method: 'PUT',
			url: '/threads/' + $stateParams.id + '/replies/' + reply._id,
			data: {
				contents: ctrl[reply._id]
			}
		})
		.then(function(response) {
			reply.contents = ctrl[reply._id];
			ctrl.editReplies[reply._id] = false;
		}, function(response) {
			
		});
	};
	$scope.removeReply = function(reply) {
		var confirm = $mdDialog.confirm()
						.title('Are you sure you want to remove this reply?')
						.ok('Yes')
						.cancel('No');
		$mdDialog.show(confirm).then(function() {
			$http({
				method: 'DELETE',
				url: '/threads/' + $stateParams.id + '/replies/' + reply._id
			}).then(function(response) {
				$scope.reloadReplies(true);
			}, function(response) {
				
			});
		}, function() {
			
		});
	};
	$scope.removeThread = function() {
		var confirm = $mdDialog.confirm()
						.title('Are you sure you want to remove this thread?')
						.ok('Yes')
						.cancel('No');
		$mdDialog.show(confirm).then(function() {
			$http({
				method: 'DELETE',
				url: '/threads/' + $stateParams.id
			}).then(function(response) {
				$state.go('root.forum.sections', { section: $scope.thread.section.name });
			}, function(response) {
				
			});
		}, function() {
			
		});
	};
}]);