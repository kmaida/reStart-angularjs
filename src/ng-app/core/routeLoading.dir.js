(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('routeLoading', routeLoading);

	routeLoading.$inject = [];
	/**
	 * routeLoading directive
	 * Sample directive with isolate scope,
	 * controller, link, transclusion
	 *
	 * @returns {object} directive
	 */
	function routeLoading() {

		routeLoadingLink.$inject = ['$scope', '$element', '$attrs', 'loading'];

		function routeLoadingLink($scope, $element, $attrs, loading) {
			var _$body = angular.element('body');
			var _winHeight = window.innerHeight + 'px';

			$scope.$watch('loading.active', function(newVal, oldVal) {
				if (newVal) {
					_$body.css({
						height: _winHeight,
						overflowY: 'hidden'
					});
				} else {
					_$body.css({
						height: 'auto',
						overflowY: 'auto'
					});
				}
			});
		}

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'ng-app/core/routeLoading.tpl.html',
			transclude: true,
			controller: routeLoadingCtrl,
			controllerAs: 'loading',
			bindToController: true,
			link: routeLoadingLink
		};
	}

	routeLoadingCtrl.$inject = ['$scope'];
	/**
	 * routeLoading CONTROLLER
	 */
	function routeLoadingCtrl($scope) {
		var loading = this;

		// for first page load
		loading.active = true;

		$scope.$on('$routeChangeStart', function($event, next, current) {
			loading.active = true;
		});

		$scope.$on('$routeChangeSuccess', function($event, current, previous) {
			loading.active = false;
		});

		$scope.$on('$routeChangeError', function($event, current, previous, rejection) {
			loading.active = false;
		});
	}

})();