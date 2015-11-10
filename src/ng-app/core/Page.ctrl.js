(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['$scope', 'Page'];

	function PageCtrl($scope, Page) {
		var page = this;

		// associate page <title>
		page.pageTitle = Page;
	}
})();