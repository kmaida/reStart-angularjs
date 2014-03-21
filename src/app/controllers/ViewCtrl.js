app.controller('ViewCtrl', ['$scope', '$routeParams', 'GlobalObj', 'JSONdata', 'myFunc', function($scope, $routeParams, GlobalObj, JSONdata, myFunc) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the viewport size onload and store it for use in the view
	$scope.viewformat = $scope.global.getviewformat();
}]);