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

		SampleDirectiveCtrl.$inject = ['$scope'];
		/**
		 * sampleDirective CONTROLLER
		 *
		 * @param $scope
		 */
		function SampleDirectiveCtrl($scope) {
			var sd = this;
		}

		sampleDirectiveLink.$inject = ['$scope', '$element', '$attrs', 'sd'];
		/**
		 * sampleDirective LINK function
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param sd {controller}
		 */
		function sampleDirectiveLink($scope, $element, $attrs, sd) {
			// watch for async data to become available and update
			$scope.$watch('sd.jsonData', function(newVal, oldVal) {
				if (newVal) {
					sd.jsonData = newVal;
				}
			});
		}

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

})();