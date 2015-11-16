(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'GlobalObj', 'Page', 'resolveLocalData'];

	function HomeCtrl($scope, GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.title = 'Home';
		home.global = GlobalObj;
		home.name = 'Visitor';
		home.alertGreeting = GlobalObj.alertGreeting;
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';

		// set page <title>
		Page.setTitle(home.title);

		// data from route resolve
		home.json = resolveLocalData;

		/**
		 * Enter small mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _enterMobile() {
			home.viewformat = 'small';
		}

		/**
		 * Exit small mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _exitMobile() {
			home.viewformat = 'large';
		}

		$scope.$on('enter-mobile', _enterMobile);
		$scope.$on('exit-mobile', _exitMobile);
	}
})();