(function() {
	'use strict';

	myApp.controller('HomeCtrl', ['GlobalObj', 'JSONData', function (GlobalObj, JSONData) {
		// controllerAs ViewModel
		var vm = this;

		// put global variables in scope
		vm.global = GlobalObj;

		// simple data binding example
		vm.name = 'Visitor';

		vm.stringOfHTML = '<strong>Some bold text</strong> bound as HTML with a <a href="#">link</a>!';

		// get the data from JSON
		JSONData.getDataAsync(function (data) {
			vm.json = data;
		});
	}]);
})();