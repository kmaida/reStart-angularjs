myApp.directive('navControl', ['mediaCheck', 'MQ', '$timeout', function(mediaCheck, MQ, $timeout) {
	function navControlLink($scope, $element, $attrs) {
		var $body = angular.element('body'),
			openNav = function() {
				$body
					.removeClass('nav-closed')
					.addClass('nav-open');
			},
			closeNav = function() {
				$body
					.removeClass('nav-open')
					.addClass('nav-closed');
			};

		mediaCheck.init({
			scope: $scope,
			mq: MQ.SMALL,
			enter: function() {
				closeNav();

				$timeout(function() {
					$scope.toggleNav = function() {
						if ($body.hasClass('nav-closed')) {
							openNav();
						} else {
							closeNav();
						}
					};
				});

				$scope.$on('$locationChangeSuccess', closeNav);
			},
			exit: function() {
				$timeout(function() {
					$scope.toggleNav = null;
				});

				$body.removeClass('nav-closed nav-open');
			}
		});
	}

	return {
		restrict: 'A',
		link: navControlLink
	};
}]);