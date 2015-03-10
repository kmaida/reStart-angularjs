// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	myApp.directive('viewSwitch', ['mediaCheck', 'MQ', '$timeout', function (mediaCheck, MQ, $timeout) {
		function viewSwitchCtrl($scope) {
			// controllerAs ViewModel
			var vm = this;

			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: function () {
					$timeout(function () {
						vm.viewformat = 'small';
					});
				},
				exit: function () {
					$timeout(function () {
						vm.viewformat = 'large';
					});
				}
			});
		}

		return {
			restrict: 'EA',
			controller: viewSwitchCtrl,
			controllerAs: 'vm',
			// bindToController: true <-- use if isolate scope
		};
	}]);
})();