var myApp = angular.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck']);

// routes
myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'ng-app/home/Home.view.html'
		})
		.when('/subpage', {
			templateUrl: 'ng-app/sub/Sub.view.html'
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

// media query constants
myApp.constant('MQ', {
	SMALL: '(max-width: 768px)',
	LARGE: '(min-width: 769px)'
});
