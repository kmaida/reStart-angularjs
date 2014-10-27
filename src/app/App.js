var app = angular.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize'])
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
		greeting: 'Hello',
		
		// get the viewformat and account for webkit bug with JS width calculations by using matchmedia
		getviewformat: function() {
			var win = window,
				matchMediaSupported = (win.matchMedia || win.msMatchMedia),
				viewport;
				
			if (matchMediaSupported) {
				// matchMedia is supported
				viewport = win.matchMedia('screen and (min-width: 641px)').matches ? 'large' : 'small';
			} else {
				// matchMedia is not supported
				viewport = $(win).width() > 640 ? 'large' : 'small';
			}
			
			return viewport;
		}
	};
});

// sample service function
app.service('myFunc', function() {
	this.doThis = function(param) {
		console.log(param);
	}
});
