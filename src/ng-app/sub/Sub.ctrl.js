(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['GlobalObj', 'JSONData', 'Page'];

	function SubCtrl(GlobalObj, JSONData, Page) {
		// controllerAs ViewModel
		var sub = this;

		// bindable members
		sub.global = GlobalObj;

		// set page <title>
		Page.setTitle('Subpage');

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