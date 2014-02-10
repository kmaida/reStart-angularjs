var app = angular.module('myApp', ['ngRoute'])
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
			.html5Mode(true)
			.hashPrefix('!');
	}]);
	
// fetch JSON data to share between controllers
app.service('JSONdata', ['$http', function($http) {
	this.getDataAsync: function(callback) {
		$http({
			method: 'GET',
			url: '/app/data/data.json'
		}).success(callback);
	}
}]);

// "global" variables to share between controllers
app.factory('GlobalObj', function() {
	return {
		greeting: 'Hello',
		getviewformat: function() {
			var viewport = $(window).width() > 640 ? 'large' : 'small';
			return viewport;
		}
	};
});

// sample factory function
app.factory('myFunc', function() {
	return {
		doThis: function(param) {
			return param;
		}
	};
});
