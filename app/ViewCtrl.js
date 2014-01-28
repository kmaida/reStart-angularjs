app.controller('ViewCtrl', ['$scope', '$routeParams', 'GlobalObj', 'JSONdata', 'myFunc', function($scope, $routeParams, GlobalObj, JSONdata, myFunc) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the viewport size onload and store it for use in the view - needed only if view is going to change dependent on size
	$scope.viewformat = $(window).width() > 640 ? 'large' : 'small';
}]);