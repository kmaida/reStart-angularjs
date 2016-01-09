(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'Utils', 'Metadata', 'JSONData'];

	function HomeCtrl($scope, Utils, Metadata, JSONData) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.title = 'Home';
		home.global = Utils;
		home.name = 'Visitor';
		home.alertGreeting = Utils.alertGreeting;
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';
		home.viewformat = null;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// set page <title>
			Metadata.set(home.title, 'reStart-angular, angularjs, javascript, boilerplate, spa, demo, app, application', 'reStart-angular demo application');

			// activate controller
			_activate();

			// mediaquery events
			$scope.$on('enter-large', _enterLarge);
			$scope.$on('exit-large', _exitLarge);
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			// start loading
			$scope.$emit('loading-on');

			// get the data from JSON
			return JSONData.getLocalData().then(_getJsonSuccess);
		}

		/**
		 * Successful promise data
		 *
		 * @param data {json}
		 * @private
		 */
		function _getJsonSuccess(data) {
			home.json = data;

			// stop loading
			$scope.$emit('loading-off');

			return home.json;
		}

		/**
		 * Enter large mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _enterLarge() {
			home.viewformat = 'large';
		}

		/**
		 * Exit large mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _exitLarge() {
			home.viewformat = 'small';
		}
	}
}());