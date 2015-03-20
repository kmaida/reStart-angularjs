(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['GlobalObj', 'JSONData'];

	function SubCtrl(GlobalObj, JSONData) {
		// controllerAs ViewModel
		var sub = this;

		// put global variables in the scope
		sub.global = GlobalObj;

		// get the data from JSON
		JSONData.getDataAsync(function(data) {
			sub.json = data;
		});
	}

})();