// For events based on viewport size - updates as viewport is resized
myApp.directive('viewSwitch', ['mediaCheck', 'MQ', '$timeout', function(mediaCheck, MQ, $timeout) {
	function viewSwitchCtrl($scope) {
		var vs = this;

		mediaCheck.init({
			scope: $scope,
			mq: MQ.SMALL,
			enter: function() {
				$timeout(function() {
					vs.viewformat = 'small';
				});
			},
			exit: function() {
				$timeout(function() {
					vs.viewformat = 'large';
				});
			}
		});
	}

	return {
		restrict: 'EA',
		controller: viewSwitchCtrl,
		controllerAs: 'vs'
	};
}]);