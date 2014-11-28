app.controller('HomeCtrl', ['$scope', 'GlobalObj', 'JSONdata', function($scope, GlobalObj, JSONdata) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// simple data binding example
	$scope.name = 'Visitor';

	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);