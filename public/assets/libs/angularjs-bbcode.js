//* AngularJS-BBcode 0.00.10 | Copyright (c) 2015 Nikita "donnikitos" Nitichevski | MIT License *//
	"use strict";


angular.module('bbModule', [])

// Available BB code snippets
	.value('snippets', {
		"b": "<b>$1</b>",																				// Bolded text
		"u": "<u>$1</u>",																				// Underlined text
		"i": "<i>$1</i>",																				// Italicized text
		"s": "<s>$1</s>",																				// Strikethrough text
		"center": "<center>$1</center>",																	// Center text
		"img": "<img src=\"$1\" />",																	// Image without title
		"img=([^\\[\\]<>]+?)": "<img src=\"$1\" alt=\"$2\" />",											// Image with title
		"url": "<a href=\"$1\" target=\"_blank\" title=\"$1\">$1</a>",									// Simple URL
		"url=([^\\[\\]<>]+?)": "<a href=\"$1\" target=\"_blank\" title=\"$2\">$2</a>",					// URL with title
		"style": function(complete, y) {																// Example of function use
			return y.toUpperCase();
		}
	})

// Format BB code
	.directive('ksBbcode', ['snippets', function(snippets) {
		return {
			"restrict": "A",
			"link": function($scope, $element, $attrs) {
				$scope.$watch(function() {
					var contents = $element.html().replace(/^\s+|\s+$/i, '');

					for(var i in snippets) {
						var regexp = new RegExp('\\[' + i + '\\](.+?)\\[\/' + i.replace(/[^a-z]/g, '') + '\\]', 'gi');

						contents = contents.replace(regexp, snippets[i]);
					}

					$element.html(contents);
				});
			}
		};
	}])

// Format new lines
	.directive('ksNl2br', [function() {
		return {
			"restrict": "A",
			"link": function($scope, $element, $attrs) {
				$scope.$watch(function() {
					var contents = $element.html().replace(/^\s+|\s+$/i, '');

					contents = contents.replace(/(?:\r\n|\n|\r)/gi, '<br>');

					$element.html(contents);
				});
			}
		};
	}]);