(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('navControl', navControl);

	navControl.$inject = ['mediaCheck', 'MQ', '$timeout', '$window'];

	function navControl(mediaCheck, MQ, $timeout, $window) {

		navControlLink.$inject = ['$scope', '$element', '$attrs'];

		function navControlLink($scope) {
			// data object
			$scope.nav = {};

			var _win = angular.element($window);
			var _body = angular.element('body');
			var _layoutCanvas = _body.find('.layout-canvas');
			var _navOpen;
			var _debounceResize;

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_layoutCanvas.css('min-height', $window.innerHeight + 'px');
			}

			/**
			 * Bind resize event to window
			 * Apply min-height to layout to
			 * make nav full-height
			 */
			function _layoutHeight() {
				$timeout.cancel(_debounceResize);
				_debounceResize = $timeout(_resized, 200);
			}

			// run initial layout height calculation
			_layoutHeight();

			// bind height calculation to window resize
			_win.bind('resize', _layoutHeight);

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_body
				.removeClass('nav-closed')
				.addClass('nav-open');

				_navOpen = true;
			}

			/**
			 * Close mobile navigation
			 *
			 * @private
			 */
			function _closeNav() {
				_body
				.removeClass('nav-open')
				.addClass('nav-closed');

				_navOpen = false;
			}

			/**
			 * Function to execute when entering mobile media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _enterMobile() {
				_closeNav();

				$timeout(function () {
					// toggle mobile navigation open/closed
					$scope.nav.toggleNav = function () {
						if (!_navOpen) {
							_openNav();
						} else {
							_closeNav();
						}
					};
				});

				$scope.$on('$locationChangeStart', _closeNav);
			}

			/**
			 * Function to execute when exiting mobile media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _exitMobile() {
				$timeout(function () {
					$scope.nav.toggleNav = null;
				});

				_body.removeClass('nav-closed nav-open');
			}

			/**
			 * Unbind resize listener on destruction of scope
			 */
			$scope.$on('$destroy', function() {
				win.unbind('resize', _layoutHeight);
			});

			// Set up functionality to run on enter/exit of media query
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			});
		}

		return {
			restrict: 'EA',
			link: navControlLink
		};
	}

})();