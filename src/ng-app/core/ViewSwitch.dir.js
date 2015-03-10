// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	angular.module('myApp').directive('viewSwitch', ['mediaCheck', 'MQ', '$timeout', viewSwitch]);

	function viewSwitch(mediaCheck, MQ, $timeout) {
		function viewSwitchCtrl($scope) {
			// controllerAs ViewModel
			var vs = this;

			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: function () {
					$timeout(function () {
						vs.viewformat = 'small';
					});
				},
				exit: function () {
					$timeout(function () {
						vs.viewformat = 'large';
					});
				}
			});
		}

		return {
			restrict: 'EA',
			controller: viewSwitchCtrl,
			controllerAs: 'vs',
			// bindToController: true <-- use if isolate scope
		};
	}
})();