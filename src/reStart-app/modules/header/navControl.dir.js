(function() {
	'use strict';

	angular
		.module('reStart')
		.directive('navControl', navControl);

	navControl.$inject = ['$window', 'resize'];

	function navControl($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			link: navControlLink
		};

		/**
		 * navControl LINK function
		 *
		 * @param $scope
		 * @param $element
		 */
		function navControlLink($scope, $element) {
			// private variables
			var _$layoutCanvas = $element;

			// data model
			$scope.nav = {};
			$scope.nav.navOpen;
			$scope.nav.toggleNav = toggleNav;

			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// initialize debounced resize
				var _rs = resize.init({
					scope: $scope,
					resizedFn: _resized,
					debounce: 100
				});

				$scope.$on('$locationChangeStart', _$locationChangeStart);
				$scope.$on('enter-large', _enterLarge);
				$scope.$on('exit-large', _exitLarge);
			}

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_$layoutCanvas.css({
					minHeight: $window.innerHeight + 'px'
				});
			}

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_$layoutCanvas
					.removeClass('nav-closed')
					.addClass('nav-open');

				$scope.navOpen = true;
			}

			/**
			 * Close mobile navigation
			 *
			 * @private
			 */
			function _closeNav() {
				_$layoutCanvas
					.removeClass('nav-open')
					.addClass('nav-closed');

				$scope.navOpen = false;
			}

			/**
			 * Toggle nav open/closed
			 */
			function toggleNav() {
				if (!$scope.navOpen) {
					_openNav();
				} else {
					_closeNav();
				}
			}

			/**
			 * When changing location, close the nav if it's open
			 */
			function _$locationChangeStart() {
				if ($scope.navOpen) {
					_closeNav();
				}
			}

			/**
			 * Function to execute when entering large media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _enterLarge(mq) {
				// unbind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = null;

				_$layoutCanvas.removeClass('nav-closed nav-open');
			}

			/**
			 * Function to execute when exiting large media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _exitLarge(mq) {
				_closeNav();

				// bind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = toggleNav;
			}
		}
	}

}());