app.controller('HeaderCtrl', ['$scope', '$location', '$routeParams', 'JSONdata', function($scope, $location, $routeParams, JSONdata) {
	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});

	// apply class to currently active nav item
	$scope.indexIsActive = function(path) {
		// path should be '/'
		return $location.path() === path;
	}

	$scope.navIsActive = function(path) {
		return $location.path().substr(0, path.length) === path;
	}
}]);