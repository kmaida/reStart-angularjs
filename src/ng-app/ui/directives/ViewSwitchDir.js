// For events based on viewport size - updates as viewport is resized
myApp.directive('viewSwitch', ['mediaCheck', 'MQ', '$timeout', function(mediaCheck, MQ, $timeout) {
	function viewSwitchCtrl($scope) {
		mediaCheck.init({
			scope: $scope,
			mq: MQ.SMALL,
			enter: function() {
				$timeout(function() {
					$scope.viewformat = 'small';
				});
			},
			exit: function() {
				$timeout(function() {
					$scope.viewformat = 'large';
				});
			}
		});
	}

	return {
		restrict: 'A',
		controller: viewSwitchCtrl
	};
}]);