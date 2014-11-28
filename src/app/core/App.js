var app = angular.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck'])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/HomeView.html'
			})
			.when('/subpage', {
				templateUrl: '/SubView.html'
			})
			.otherwise({
				redirectTo: '/'
			});
		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}]);
