'use strict';

var app = angular.module('Ninpou');

app.controller('BlogCtrl', ['$scope', function($scope) {
	$scope.posts = [
	{
		_id: '58f3c1de8ac7b1abf4311629',
		authorOpenID: '',
		title: 'One Post',
		post: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In in elit diam. Vivamus dapibus vestibulum dolor, congue aliquam elit euismod vel. Nullam ut mi arcu. Etiam ultricies, magna vel congue porta, tortor massa viverra ex, non mollis ante nisl in arcu. Sed eget orci tortor. Fusce iaculis consectetur orci, sed ornare sapien consectetur eu. Proin eu imperdiet lectus. Aenean id tincidunt nisl, et pretium urna. Nunc nibh dui, condimentum eget pharetra et, efficitur a nisl. Integer eu sapien a ex posuere pharetra. Nunc aliquet eleifend arcu. Suspendisse potenti. Integer a diam nec mauris aliquam malesuada vel non tortor.</p><p>Nam aliquet ut neque a vehicula. Cras fringilla sem non cursus tristique. Morbi sed magna ante. Phasellus pretium sem id nisl molestie sollicitudin at sed leo. Ut laoreet vitae lacus et venenatis. Phasellus aliquet elementum finibus. Etiam nec neque sit amet mi condimentum scelerisque nec sit amet leo. Mauris pharetra sem non dictum dictum. Vivamus diam justo, semper sit amet venenatis sit amet, pharetra quis urna. Mauris vitae consectetur ligula. Nulla consectetur nisi fringilla maximus congue.</p><p>Praesent ac vehicula est. Curabitur id felis rutrum, semper dui a, pulvinar leo. Nunc efficitur, augue et rutrum venenatis, nisl dolor tempor urna, id consequat sapien tellus sodales justo. Phasellus in fringilla turpis. Mauris quis tortor sit amet odio vehicula sodales. Sed eget metus at turpis egestas posuere. Suspendisse vitae ante massa. Sed sodales lectus nec est congue, ac sodales ligula fringilla. Morbi rutrum, ex id iaculis tempor, quam mauris egestas est, ac hendrerit turpis magna ut nulla. Sed porttitor bibendum neque vitae molestie.</p>',
		comments: []
	},
	{
		_id: '58f3c1de8ac7b1abf4311629',
		authorOpenID: '',
		title: 'One Post',
		post: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In in elit diam. Vivamus dapibus vestibulum dolor, congue aliquam elit euismod vel. Nullam ut mi arcu. Etiam ultricies, magna vel congue porta, tortor massa viverra ex, non mollis ante nisl in arcu. Sed eget orci tortor. Fusce iaculis consectetur orci, sed ornare sapien consectetur eu. Proin eu imperdiet lectus. Aenean id tincidunt nisl, et pretium urna. Nunc nibh dui, condimentum eget pharetra et, efficitur a nisl. Integer eu sapien a ex posuere pharetra. Nunc aliquet eleifend arcu. Suspendisse potenti. Integer a diam nec mauris aliquam malesuada vel non tortor.</p><p>Nam aliquet ut neque a vehicula. Cras fringilla sem non cursus tristique. Morbi sed magna ante. Phasellus pretium sem id nisl molestie sollicitudin at sed leo. Ut laoreet vitae lacus et venenatis. Phasellus aliquet elementum finibus. Etiam nec neque sit amet mi condimentum scelerisque nec sit amet leo. Mauris pharetra sem non dictum dictum. Vivamus diam justo, semper sit amet venenatis sit amet, pharetra quis urna. Mauris vitae consectetur ligula. Nulla consectetur nisi fringilla maximus congue.</p><p>Praesent ac vehicula est. Curabitur id felis rutrum, semper dui a, pulvinar leo. Nunc efficitur, augue et rutrum venenatis, nisl dolor tempor urna, id consequat sapien tellus sodales justo. Phasellus in fringilla turpis. Mauris quis tortor sit amet odio vehicula sodales. Sed eget metus at turpis egestas posuere. Suspendisse vitae ante massa. Sed sodales lectus nec est congue, ac sodales ligula fringilla. Morbi rutrum, ex id iaculis tempor, quam mauris egestas est, ac hendrerit turpis magna ut nulla. Sed porttitor bibendum neque vitae molestie.</p>',
		comments: []
	},
	{
		_id: '58f3c1de8ac7b1abf4311629',
		authorOpenID: '',
		title: 'One Post',
		post: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In in elit diam. Vivamus dapibus vestibulum dolor, congue aliquam elit euismod vel. Nullam ut mi arcu. Etiam ultricies, magna vel congue porta, tortor massa viverra ex, non mollis ante nisl in arcu. Sed eget orci tortor. Fusce iaculis consectetur orci, sed ornare sapien consectetur eu. Proin eu imperdiet lectus. Aenean id tincidunt nisl, et pretium urna. Nunc nibh dui, condimentum eget pharetra et, efficitur a nisl. Integer eu sapien a ex posuere pharetra. Nunc aliquet eleifend arcu. Suspendisse potenti. Integer a diam nec mauris aliquam malesuada vel non tortor.</p><p>Nam aliquet ut neque a vehicula. Cras fringilla sem non cursus tristique. Morbi sed magna ante. Phasellus pretium sem id nisl molestie sollicitudin at sed leo. Ut laoreet vitae lacus et venenatis. Phasellus aliquet elementum finibus. Etiam nec neque sit amet mi condimentum scelerisque nec sit amet leo. Mauris pharetra sem non dictum dictum. Vivamus diam justo, semper sit amet venenatis sit amet, pharetra quis urna. Mauris vitae consectetur ligula. Nulla consectetur nisi fringilla maximus congue.</p><p>Praesent ac vehicula est. Curabitur id felis rutrum, semper dui a, pulvinar leo. Nunc efficitur, augue et rutrum venenatis, nisl dolor tempor urna, id consequat sapien tellus sodales justo. Phasellus in fringilla turpis. Mauris quis tortor sit amet odio vehicula sodales. Sed eget metus at turpis egestas posuere. Suspendisse vitae ante massa. Sed sodales lectus nec est congue, ac sodales ligula fringilla. Morbi rutrum, ex id iaculis tempor, quam mauris egestas est, ac hendrerit turpis magna ut nulla. Sed porttitor bibendum neque vitae molestie.</p>',
		comments: []
	}
	];
}]);