// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('myApp')
		.service('JSONData', jsonData);

	jsonData.$inject = ['$http'];

	function jsonData($http) {
		this.getDataAsync = function() {
			return $http
				.get('/ng-app/data/data.json')
				.then(
					function(response) {
						if (typeof response.data === 'object') {
							return response.data;
						} else {
							throw new Error('retrieved data is not typeof object.');
						}
					}
				);
		}
	}
})();