(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'JSONData'];

	function headerCtrl($scope, $location, JSONData) {
		// controllerAs ViewModel
		var header = this;

		// get the data from JSON
		JSONData.getDataAsync().then(
			function(response) {
				header.json = response.data;
			}
		);

		// apply class to currently active nav item
		header.indexIsActive = function(path) {
			// path should be '/'
			return $location.path() === path;
		};
		header.navIsActive = function (path) {
			return $location.path().substr(0, path.length) === path;
		};
	}

})();