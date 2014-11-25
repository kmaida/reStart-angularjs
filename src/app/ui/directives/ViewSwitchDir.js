// For events based on viewport size - updates as viewport is resized
app.directive('viewSwitch', ['mediaCheck', '$timeout', function(mediaCheck, $timeout) {
	return {
		restrict: 'A',
		controller: function($scope) {
			mediaCheck.init({
				scope: $scope,
				mq: '(max-width: 640)',
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