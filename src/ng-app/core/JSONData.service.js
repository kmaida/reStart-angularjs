// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('myApp')
		.service('JSONData', JSONData);

	JSONData.$inject = ['$http'];

	function JSONData($http) {
		this.getDataAsync = function(callback) {
			$http({
				method: 'GET',
				url: '/ng-app/data/data.json'
			}).success(callback);
		}
	}
})();