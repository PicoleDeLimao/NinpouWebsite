'use strict';

var app = angular.module('Ninpou');

app.controller('ForumThreadsCtrl', ['$scope', '$stateParams', '$state', '$http', '$timeout', '$mdDialog', 'Thread', 'MongoService', 'SectionData',
function($scope, $stateParams, $state, $http, $timeout, $mdDialog, Thread, MongoService, SectionData) {
	var that = this;
	window.scrollTo(0,0);
	$scope.thread = Thread;
	$scope.sectionData = SectionData;
	$scope.addTagToTextAreaSelection = function(id, varname, startTag, endTag) {
		var textArea = document.getElementById(id);
		var start = textArea.selectionStart;
		var finish = textArea.selectionEnd;
		var preSelection = textArea.value.substring(0, start);
		var selection = textArea.value.substring(start, finish);
		var postSelection = textArea.value.substring(finish, textArea.value.length);
		textArea.value = preSelection + startTag + selection + endTag + postSelection;
		textArea.focus();
		that[varname] = textArea.value;
	};
	$scope.bold = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[b]', '[/b]');
	};
	$scope.italic = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[i]', '[/i]');
	};
	$scope.underline = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[u]', '[/u]');
	};
	$scope.strike = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[s]', '[/s]');
	};
	$scope.picture = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[img]', '[/img]');
	};
	$scope.link = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[url]http://', '[/url]');
	};
	$scope.center = function(id, varname) {
		$scope.addTagToTextAreaSelection(id, varname, '[center]', '[/center]');
	};
	$scope.sendReply = function(id) {
		var el = document.getElementById(id);
		$http({
			method: 'POST',
			url: '/threads/' + $stateParams.id + '/replies',
			data: {
				contents: that.replyContents
			}
		})
		.then(function(response) {
			that.replyContents = '';
			$scope.reloadReplies();
		}, function(response) {
			console.log(response);
		});
	};
	$scope.currentPage = 1;
	$scope.numRepliesPerPage = 10;
	$scope.replies = $scope.thread.replies.slice(0, $scope.numRepliesPerPage);
	$scope.numPages = Math.ceil($scope.thread.replies.length / $scope.numRepliesPerPage);
	$scope.pages = [];
	for (var i = 1; i <= $scope.numPages; i++) {
		$scope.pages.push(i);
	}
	$scope.loadReplies = function(page) {
		$scope.currentPage = page;
		$scope.replies = $scope.thread.replies.slice((page - 1) * $scope.numRepliesPerPage, page * $scope.numRepliesPerPage);
		$timeout(function() {
			document.getElementById('reply-start').scrollIntoView();
		});
	};
	$scope.reloadReplies = function(gotoFirstPage) {
		$http.get('/threads/' + $stateParams.id + '/replies')
		.then(function(response) {
			$scope.thread.replies = response.data;
			$scope.numPages = Math.ceil($scope.thread.replies.length / $scope.numRepliesPerPage);
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
		return moment(MongoService.oidToDate(time)).fromNow();
	};
	$scope.saveThread = function() {
		$http({
			method: 'PUT',
			url: '/threads/' + $stateParams.id,
			data: {
				title: that.threadTitle,
				contents: that.threadContents
			}
		})
		.then(function(response) {
			$scope.thread.title = that.threadTitle;
			$scope.thread.contents = that.threadContents;
			that.editThread = false;
		}, function(response) {
			
		});
	}
	$scope.saveReply = function(reply) {
		$http({
			method: 'PUT',
			url: '/threads/' + $stateParams.id + '/replies/' + reply._id,
			data: {
				contents: that[reply._id]
			}
		})
		.then(function(response) {
			reply.contents = that[reply._id];
			that.editReplies[reply._id] = false;
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