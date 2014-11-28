app.controller('HomeCtrl', ['$scope', 'GlobalObj', 'JSONData', function($scope, GlobalObj, JSONData) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// simple data binding example
	$scope.name = 'Visitor';

	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);