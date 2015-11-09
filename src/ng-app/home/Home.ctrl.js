(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['GlobalObj', 'JSONData', 'Page'];

	function HomeCtrl(GlobalObj, JSONData, Page) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.global = GlobalObj;
		home.name = 'Visitor';
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';

		// set page <title>
		Page.setTitle('Home');

		/**
		 * Successful promise data
		 *
		 * @param data {json}
		 * @private
		 */
		function _getJsonSuccess(data) {
			home.json = data;
		}

		// get the data from JSON
		JSONData.getLocalData().then(_getJsonSuccess);
	}
})();