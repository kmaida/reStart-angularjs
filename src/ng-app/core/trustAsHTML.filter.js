(function() {
	'use strict';

	myApp.filter('trustAsHTML', ['$sce', function ($sce) {
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}]);
})();