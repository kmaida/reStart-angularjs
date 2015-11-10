// config
(function() {
	'use strict';

	angular
		.module('myApp')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'ng-app/home/Home.view.html',
				controller: 'HomeCtrl',
				controllerAs: 'home',
				resolve: {
					resolveLocalData: resolveLocalData
				}
			})
			.when('/subpage', {
				templateUrl: 'ng-app/sub/Sub.view.html',
				controller: 'SubCtrl',
				controllerAs: 'sub',
				resolve: {
					resolveLocalData: resolveLocalData
				}
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}

	resolveLocalData.$inject = ['JSONData'];
	/**
	 * Get local data for route resolve
	 *
	 * @param JSONData {factory}
	 * @returns {promise}
	 */
	function resolveLocalData(JSONData) {
		return JSONData.getLocalData();
	}
})();