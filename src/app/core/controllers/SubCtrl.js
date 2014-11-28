app.controller('SubCtrl', ['$scope', 'GlobalObj', 'JSONdata', function($scope, GlobalObj, JSONdata) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);