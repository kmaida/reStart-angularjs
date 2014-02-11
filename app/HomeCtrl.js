app.controller('HomeCtrl', ['$scope', '$routeParams', 'GlobalObj', 'JSONdata', 'myFunc', function($scope, $routeParams, GlobalObj, JSONdata, myFunc) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// simple data binding example
	$scope.name = 'Visitor';

	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});

	// call a service
	myFunc.doThis('boo');
}]);