// Directives (and associated attributes) are camelCase in JS and snake-case in HTML
// Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
// Complex JavaScript DOM manipulation should always be done in directives, and $apply should never be used in a controller! Simpler DOM manipulation should be in the view.

/*--- For template switching based on viewport size - updates as viewport is resized ---*/
/*--- In the view controller, set a default viewformat size based on the screen width onload ---*/
app.directive('viewSwitch', function() {
	return {
		restrict: 'A',
		scope: {},
		link: function(scope, element, attrs) {
			$(document.body)
				.on('enter-large', function(e) {
					scope.viewformat = 'large';
				})
				.on('enter-small', function(e) {
					scope.viewformat = 'small';
				});
		}
	};
});

/*--- Sample Directive with a $watch ---*/
app.directive('directiveName', function() {
	return {
		restrict: 'A',
		templateUrl: 'view/tpl/TemplateTpl.html',
		transclude: true,
		link: function(scope, element, attrs) {
			// watch for async data to become available and update
			scope.$watch('json', function(json) {
				if (json) {	// safeguard against watched data being undefined
					console.log(json);
				}
			}, true);
		}
	};
});