(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('routeLoading', routeLoading);

	routeLoading.$inject = ['$window', '$timeout', 'resize'];

	function routeLoading($window, $timeout, resize) {

		routeLoadingLink.$inject = ['$scope', '$element', '$attrs', 'loading'];

		/**
		 * routeLoading LINK
		 * Disables page scrolling when loading overlay is open
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param loading {controller}
		 */
		function routeLoadingLink($scope, $element, $attrs, loading) {
			var _$body = angular.element('body');
			var _winHeight = $window.innerHeight + 'px';

			/**
			 * Window resized
			 * If loading, reapply body height
			 * to prevent scrollbar
			 *
			 * @private
			 */
			function _resized() {
				_winHeight = $window.innerHeight + 'px';

				if (loading.active) {
					_$body.css({
						height: _winHeight,
						overflowY: 'hidden'
					});
				}
			}

			/**
			 * Initialize debounced resize
			 */
			resize.init({
				scope: $scope,
				resizedFn: _resized,
				debounce: 200
			});

			/**
			 * $watch loading.active
			 *
			 * @param newVal {boolean}
			 * @param oldVal {undefined|boolean}
			 */
			function $watchActive(newVal, oldVal) {
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
			}

			$scope.$watch('loading.active', $watchActive);
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
	 * Update the loading status based
	 * on routeChange state
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