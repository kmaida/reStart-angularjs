(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['GlobalObj', 'Page', 'resolveLocalData'];

	function HomeCtrl(GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.title = 'Home';
		home.global = GlobalObj;
		home.name = 'Visitor';
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';

		// set page <title>
		Page.setTitle(home.title);

		// data from route resolve
		home.json = resolveLocalData;
	}
})();