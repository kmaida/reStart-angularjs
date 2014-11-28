var app = angular.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck'])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/view/HomeView.html'
			})
			.when('/subpage', {
				templateUrl: '/view/SubView.html'
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
	
// fetch JSON data to share between controllers
app.service('JSONdata', ['$http', function($http) {
	this.getDataAsync = function(callback) {
		$http({
			method: 'GET',
			url: '/app/data/data.json'
		}).success(callback);
	}
}]);

// "global" object to share between controllers
app.factory('GlobalObj', function() {
	return {
		greeting: 'Hello'
	};
});
