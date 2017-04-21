'use strict';

var app = angular.module('Ninpou');

app.directive('bbcodeButtons', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			modelName: '='
		},
		template: [
			'<div class="pages">',
			'	<input type="hidden" ng-model="modelName">',
			'	<md-button><b>B</b></md-button>',
			'	<md-button><i>I</i></md-button>',
			'	<md-button><u>U</u></md-button>',
			'	<md-button><strike>S</strike></md-button>',
			'	<md-button aria-label="Center"><i class="fa fa-align-center"></i></md-button>',
			'	<md-button aria-label="Picture"><i class="fa fa-picture-o"></i></md-button>',
			'	<md-button aria-label="Link"><i class="fa fa-link"></i></md-button>',
			'</div>'
		].join(''),
		controller: ['$parse', '$timeout', '$scope', function($parse, $timeout, $scope) {
			var ctrl = this;
			$timeout(function() {
				ctrl.ready = true;
			});
			ctrl.addTagToTextAreaSelection = function(id, startTag, endTag) {
				var textArea = document.getElementById(id);
				var start = textArea.selectionStart;
				var finish = textArea.selectionEnd;
				var preSelection = textArea.value.substring(0, start);
				var selection = textArea.value.substring(start, finish);
				var postSelection = textArea.value.substring(finish, textArea.value.length);
				textArea.value = preSelection + startTag + selection + endTag + postSelection;
				textArea.focus();
				$scope.modelName = textArea.value;
			};
			ctrl.functions = {
				bold: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[b]', '[/b]');
				},
				italic: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[i]', '[/i]');
				},
				underline: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[u]', '[/u]');
				},
				strike: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[s]', '[/s]');
				},
				center: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[center]', '[/center]');
				},
				picture: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[img]', '[/img]');
				},
				link: function(id) {
					ctrl.addTagToTextAreaSelection(id, '[url]http://', '[/url]');
				}
			}
		}],
		link: function(scope, element, attributes, controller) {
			var styles = ['bold', 'italic', 'underline', 'strike', 'center', 'picture', 'link'];
			(function next(i) {
				if (i < styles.length) {
					angular.element(angular.element(element.children()[0]).children()[i + 1]).on('click', function() {
						controller.functions[styles[i]](attributes.elementId);
					});
					next(i + 1);
				}
			})(0);
		}
	};
});