(function() {
	'use strict';

	angular.module('myApp').filter('trustAsHTML', ['$sce', trustAsHTML]);

	function trustAsHTML($sce) {
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}
})();