// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('JSONData', JSONData);

	JSONData.$inject = ['$http', 'Res'];

	function JSONData($http, Res) {
		// callable members
		return {
			getLocalData: getLocalData
		};

		/**
		 * GET local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getLocalData() {
			return $http
				.get('/data/data.json')
				.then(Res.success, Res.error);
		}
	}
})();