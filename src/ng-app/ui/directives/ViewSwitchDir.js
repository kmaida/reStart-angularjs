// For events based on viewport size - updates as viewport is resized
app.directive('viewSwitch', ['mediaCheck', 'MQ', '$timeout', function(mediaCheck, MQ, $timeout) {
	return {
		restrict: 'A',
		controller: function($scope) {
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
	};
}]);