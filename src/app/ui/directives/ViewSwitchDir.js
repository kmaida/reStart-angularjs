// For template switching based on viewport size - updates as viewport is resized
// In the view controller, set a default viewformat size based on the screen width onload
app.directive('viewSwitch', ['GlobalObj', function(GlobalObj) {
	return {
		restrict: 'A',
		controller: function($scope) {
			// get the viewport size onload and store it for use in the view
			$scope.viewformat = GlobalObj.getviewformat();
		},
		link: function(scope, element, attrs) {
			$(document.body)
				.on('enter-large', function(e) {
					scope.$apply(function() {
						scope.viewformat = 'large';
					});
				})
				.on('enter-small', function(e) {
					scope.$apply(function() {
						scope.viewformat = 'small';
					});
				});
		}
	};
}]);