// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('viewSwitch', viewSwitch);

	viewSwitch.$inject = ['mediaCheck', 'MQ', '$timeout'];

	function viewSwitch(mediaCheck, MQ, $timeout) {

		viewSwitchLink.$inject = ['$scope'];
		
		function viewSwitchLink($scope) {
			// data object
			$scope.vs = {};

			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: function () {
					$timeout(function () {
						$scope.vs.viewformat = 'small';
					});
				},
				exit: function () {
					$timeout(function () {
						$scope.vs.viewformat = 'large';
					});
				}
			});
		}

		return {
			restrict: 'EA',
			link: viewSwitchLink
		};
	}
})();