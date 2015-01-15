app.controller('HeaderCtrl', ['$scope', '$location', '$routeParams', 'JSONData', function($scope, $location, $routeParams, JSONData) {
	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});

	// apply class to currently active nav item
	$scope.indexIsActive = function(path) {
		// path should be '/'
		return $location.path() === path;
	};
	$scope.navIsActive = function(path) {
		return $location.path().substr(0, path.length) === path;
	};
	
	// apply body class based on url
	$scope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
		var getBodyClass = function(url) {
				var bodyClass = url.substr(url.lastIndexOf('/') + 1);
				
				return !!bodyClass ? 'page-' + bodyClass : 'page-home';
			},
			oldBodyClass = getBodyClass(oldUrl),
			newBodyClass = getBodyClass(newUrl);
			
		angular.element('body')
			.removeClass(oldBodyClass)
			.addClass(newBodyClass);
	});
	
}]);