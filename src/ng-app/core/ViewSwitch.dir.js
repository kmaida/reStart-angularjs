// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('viewSwitch', viewSwitch);

	function viewSwitch() {
		return {
			restrict: 'A',
			controller: viewSwitchCtrl
		};
	}

	viewSwitchCtrl.$inject = ['$scope', 'mediaCheck', 'MQ', '$rootScope'];

	function viewSwitchCtrl($scope, mediaCheck, MQ, $rootScope) {
		/**
		 * Function to run on enter media query
		 * $broadcast 'enter-mobile' event
		 *
		 * @param {object} mq media query
		 */
		function _enterFn(mq) {
			console.log('vs');
			$rootScope.$broadcast('enter-mobile');
		}

		/**
		 * Function to run on exit media query
		 * $broadcast 'exit-mobile' event
		 *
		 * @param {object} mq media query
		 */
		function _exitFn(mq) {
			console.log('vs');
			$rootScope.$broadcast('exit-mobile');
		}

		// initialize mediaCheck
		mediaCheck.init({
			scope: $scope,
			mq: MQ.SMALL,
			enter: _enterFn,
			exit: _exitFn,
			debounce: 200
		});
	}
})();