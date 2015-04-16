(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['GlobalObj', 'JSONData'];

	function HomeCtrl(GlobalObj, JSONData) {
		// controllerAs ViewModel
		var home = this;

		// put global variables in scope
		home.global = GlobalObj;

		// simple data binding example
		home.name = 'Visitor';

		// simple SCE ng-bind-html example
		home.stringOfHTML = '<strong>Some bold text</strong> bound as HTML with a <a href="#">link</a>!';

		// get the data from JSON
		JSONData.getDataAsync().then(
			function(response) {
				home.json = response.data;
			}
		);
	}
})();