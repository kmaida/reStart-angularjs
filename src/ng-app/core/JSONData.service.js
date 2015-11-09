// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('myApp')
		.service('JSONData', JSONData);

	/**
	 * Promise response function - success
	 * Checks typeof data returned and succeeds if JS object, throws error if not
	 *
	 * @param response {*} data from $http
	 * @returns {object|Array}
	 * @private
	 */
	function _successRes(response) {
		if (typeof response.data === 'object') {
			return response.data;
		} else {
			throw new Error('retrieved data is not typeof object.');
		}
	}

	/**
	 * Promise response function - error
	 * Throws an error with error data
	 *
	 * @param error {object}
	 * @private
	 */
	function _errorRes(error) {
		throw new Error('error retrieving data', error);
	}

	JSONData.$inject = ['$http'];

	function JSONData($http) {
		// callable members
		this.getLocalData = getLocalData;

		/**
		 * Get local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getLocalData() {
			return $http
				.get('/ng-app/data/data.json')
				.then(_successRes, _errorRes);
		}
	}
})();