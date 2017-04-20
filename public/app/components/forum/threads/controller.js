'use strict';

var app = angular.module('Ninpou');

app.controller('ForumThreadsCtrl', ['$scope', '$stateParams', '$http', 'Thread', 'MongoService', 'SectionData',
function($scope, $stateParams, $http, Thread, MongoService, SectionData) {
	window.scrollTo(0,0);
	$scope.thread = Thread;
	$scope.sectionData = SectionData;
	$scope.sendReply = function(contents) {
		$http({
			method: 'POST',
			url: '/threads/' + $stateParams.id + '/replies',
			data: {
				contents: contents
			}
		})
		.then(function(response) {
			var form = document.getElementById("myForm");
			form.reset();
		}, function(response) {
			console.log(response);
		});
	};
}]);