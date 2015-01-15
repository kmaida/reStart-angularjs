app.controller('SubCtrl', ['$scope', 'GlobalObj', 'JSONData', function($scope, GlobalObj, JSONData) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);