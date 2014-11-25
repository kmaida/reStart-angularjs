app.controller('HomeCtrl', ['$scope', '$routeParams', 'GlobalObj', 'JSONdata', 'mediaCheck', function($scope, $routeParams, GlobalObj, JSONdata, mediaCheck) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// simple data binding example
	$scope.name = 'Visitor';
	
	mediaCheck.init({
		scope: $scope,
		mq: '(max-width: 768px)',
		enter: function(mq) {
			console.log('entered media query!');
		}
	});

	// get the data from JSON
	JSONdata.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);