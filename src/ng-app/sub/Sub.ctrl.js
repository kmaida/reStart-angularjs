myApp.controller('SubCtrl', ['GlobalObj', 'JSONData', function(GlobalObj, JSONData) {
	// controllerAs ViewModel
	var vm = this;

	// put global variables in the scope
	vm.global = GlobalObj;

	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		vm.json = data;
	});
}]);