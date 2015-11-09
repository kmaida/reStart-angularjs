// Directives (and associated attributes) are camelCase in JS and snake-case in HTML
// Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
// Complex JavaScript DOM manipulation should always be done in directives, and $apply should never be used in a controller! Simpler DOM manipulation should be in the view.

/*--- Sample Directive with a $watch ---*/
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('sampleDirective', sampleDirective);

	/**
	 * sampleDirective directive
	 * Sample directive with isolate scope,
	 * controller, link, transclusion
	 *
	 * @returns {object} directive
	 */
	function sampleDirective() {
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				jsonData: '='
			},
			templateUrl: 'ng-app/sub/sample.tpl.html',
			transclude: true,
			controller: SampleDirectiveCtrl,
			controllerAs: 'sd',
			bindToController: true,
			link: sampleDirectiveLink
		};
	}

	SampleDirectiveCtrl.$inject = ['$scope'];
	/**
	 * sampleDirective CONTROLLER
	 *
	 * @param $scope
	 */
	function SampleDirectiveCtrl($scope) {
		var sd = this;

		console.log('Hello from directive controller');
	}

	sampleDirectiveLink.$inject = ['$scope', '$element', '$attrs'];
	/**
	 * sampleDirective LINK function
	 *
	 * @param $scope
	 * @param $element
	 * @param $attrs
	 */
	function sampleDirectiveLink($scope, $element, $attrs) {
		// data object
		$scope.sdl = {};

		// watch for async data to become available and update
		$scope.$watch('jsonData', function(newVal, oldVal) {
			if (newVal) {
				$scope.sdl.jsonData = $scope.jsonData;
			}
		}, true);
	}

})();