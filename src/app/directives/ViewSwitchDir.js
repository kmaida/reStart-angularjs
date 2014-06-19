// For template switching based on viewport size - updates as viewport is resized
// In the view controller, set a default viewformat size based on the screen width onload
app.directive('viewSwitch', function() {
	return {
		restrict: 'A',
		controller: 'ViewCtrl',
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
});