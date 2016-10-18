(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'Utils', 'MQ', 'mediaCheck', 'Metadata', 'JSONData'];

	function HomeCtrl($scope, Utils, MQ, mediaCheck, Metadata, JSONData) {
		// controllerAs ViewModel
		var home = this;

		// Set up functionality to run on enter/exit of media query
		var _mc = mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.LARGE,
				enter: _enterLarge,
				exit: _exitLarge
			},
			debounce: 200
		});

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