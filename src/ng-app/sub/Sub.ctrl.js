(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['GlobalObj', 'Page', 'resolveLocalData'];

	function SubCtrl(GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var sub = this;

		// bindable members
		sub.global = GlobalObj;

		// set page <title>
		Page.setTitle('Subpage');

		// data from route resolve
		sub.json = resolveLocalData;
	}

})();