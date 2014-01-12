app.controller('HomeCtrl', ['$scope', '$routeParams', 'GlobalObj', 'JSONdata', 'myFunc', function($scope, $routeParams, GlobalObj, JSONdata, myFunc) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the viewport size onload and store it for use in the view - needed only if view is going to change dependent on size
	$scope.viewformat = $scope.global.getviewformat();

	// simple data binding example
	$scope.name = 'Visitor';

	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});

	// call a factory function
	$scope.thisDone = myFunc.doThis('boo');
}]);