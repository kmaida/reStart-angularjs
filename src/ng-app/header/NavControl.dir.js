(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('navControl', navControl);

	navControl.$inject = ['mediaCheck', 'MQ', '$timeout'];

	function navControl(mediaCheck, MQ, $timeout) {

		navControlLink.$inject = ['$scope', '$element', '$attrs'];

		function navControlLink($scope) {
			// data object
			$scope.nav = {};

			var _body = angular.element('body'),
				_navOpen;

			// open mobile navigation (private)
			function _openNav() {
				_body
					.removeClass('nav-closed')
					.addClass('nav-open');

				_navOpen = true;
			}

			// close mobile navigation (private)
			function _closeNav() {
				_body
					.removeClass('nav-open')
					.addClass('nav-closed');

				_navOpen = false;
			}

			// function to run on enter media query (private)
			function _navEnterFn() {
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

				$scope.$on('$locationChangeSuccess', _closeNav);
			}

			// function to run on exit media query (private)
			function _navExitFn() {
				$timeout(function () {
					$scope.nav.toggleNav = null;
				});

				_body.removeClass('nav-closed nav-open');
			}

			// initialize mediaCheck
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: _navEnterFn,
				exit: _navExitFn
			});
		}

		return {
			restrict: 'EA',
			link: navControlLink
		};
	}

})();