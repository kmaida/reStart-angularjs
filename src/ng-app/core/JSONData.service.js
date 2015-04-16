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
					function(data) {
						return data;
					},
					function(error) {
						console.log('Error', error);
					}
				);
		}
	}
})();