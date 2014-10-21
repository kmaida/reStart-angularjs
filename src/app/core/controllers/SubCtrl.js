app.controller('SubCtrl', ['$scope', '$routeParams', 'GlobalObj', 'JSONdata', 'myFunc', function($scope, $routeParams, GlobalObj, JSONdata, myFunc) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);