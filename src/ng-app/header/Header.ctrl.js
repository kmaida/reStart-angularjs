(function() {
	'use strict';

	myApp.controller('HeaderCtrl', ['$scope', '$location', '$routeParams', 'JSONData', HeaderCtrl]);

	function HeaderCtrl($scope, $location, $routeParams, JSONData) {
		// controllerAs ViewModel
		var header = this;

		// get the data from JSON
		JSONData.getDataAsync(function (data) {
			header.json = data;
		});

		// apply class to currently active nav item
		header.indexIsActive = function (path) {
			// path should be '/'
			return $location.path() === path;
		};
		header.navIsActive = function (path) {
			return $location.path().substr(0, path.length) === path;
		};

		// apply body class based on url (TODO: consider moving to a factory)
		$scope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
			var getBodyClass = function (url) {
					var bodyClass = url.substr(url.lastIndexOf('/') + 1);

					return !!bodyClass ? 'page-' + bodyClass : 'page-home';
				},
				oldBodyClass = getBodyClass(oldUrl),
				newBodyClass = getBodyClass(newUrl);

			angular.element('body')
				.removeClass(oldBodyClass)
				.addClass(newBodyClass);
		});
	}

})();