(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('SubCtrl', subCtrl);

	subCtrl.$inject = ['GlobalObj', 'JSONData', 'Page'];

	function subCtrl(GlobalObj, JSONData, Page) {
		// controllerAs ViewModel
		var sub = this;

		Page.setTitle('Subpage');

		// put global variables in the scope
		sub.global = GlobalObj;

		/**
		 * Successful promise data
		 *
		 * @param data {json}
		 * @private
		 */
		function _getJsonSuccess(data) {
			sub.json = data;
		}

		// get the data from JSON
		JSONData.getLocalData().then(_getJsonSuccess);
	}

})();