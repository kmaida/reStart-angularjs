(function() {
	'use strict';

	angular
		.module('reStart')
		.directive('svgIcon', svgIcon);

	function svgIcon() {
		// return directive
		return {
			restrict: 'E',
			replace: true,
			scope: {
				name: '@'
			},
			template: '<svg class="icon {{::name}}"><use xlink:href="{{::xlinkHref}}" /></svg>',
			link: svgIconLink
		};

		function svgIconLink($scope, $attrs, $element) {
			$scope.xlinkHref = '/assets/images/svg/sprite.symbol.svg#' + $scope.name;
		}
	}
}());