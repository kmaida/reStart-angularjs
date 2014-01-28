var app = angular.module('myApp', [])
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

// fetch JSON data to share between controllers
app.factory('JSONdata', ['$http', function($http) {
	return {
		getDataAsync: function(callback) {
			$http({
				method: 'GET',
				url: '/app/data/data.json'
			}).success(callback);
		}
	};
}]);

// sample factory function
app.factory('myFunc', function() {
	return {
		doThis: function(param) {
			return param;
		}
	};
});