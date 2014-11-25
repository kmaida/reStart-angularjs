// For events based on viewport size - updates as viewport is resized
app.directive('header', ['mediaCheck', '$timeout', function(mediaCheck, $timeout) {
	return {
		restrict: 'A',
		templateUrl: 'view/tpl/NavTpl.html',
		replace: true,
		link: function($scope, $element, $attrs) {
			var $body = angular.element('body');

			$scope.openNav = function() {
				$body
					.removeClass('nav-closed')
					.addClass('nav-open');
			};

			$scope.closeNav = function() {
				$body
					.removeClass('nav-open')
					.addClass('nav-closed');
			};

			mediaCheck.init({
				scope: $scope,
				mq: '(max-width: 640)',
				enter: function() {
					// do clicks
				},
				exit: function() {
					// don't do clicks
					// remove all classes
				}
			});
		}
	};
}]);