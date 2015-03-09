myApp.controller('HomeCtrl', ['$scope', 'GlobalObj', 'JSONData', function($scope, GlobalObj, JSONData) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// simple data binding example
	$scope.name = 'Visitor';

	$scope.stringOfHTML = '<strong>Some bold text</strong> bound as HTML with a <a href="#">link</a>!';

	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);