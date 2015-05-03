(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'JSONData'];

	function headerCtrl($scope, $location, JSONData) {
		// controllerAs ViewModel
		var header = this;

		/**
		 * Successful promise data
		 *
		 * @param data {json}
		 * @private
		 */
		function _getJsonSuccess(data) {
			header.json = data;
		}

		// get the data from JSON
		JSONData.getLocalData().then(_getJsonSuccess);

		/**
		 * Apply class to index nav if active
		 *
		 * @param {string} path
 		 */
		header.indexIsActive = function(path) {
			// path should be '/'
			return $location.path() === path;
		};

		/**
		 * Apply class to currently active nav item
		 *
		 * @param {string} path
		 */
		header.navIsActive = function(path) {
			return $location.path().substr(0, path.length) === path;
		};
	}

})();