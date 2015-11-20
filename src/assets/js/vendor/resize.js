(function() {
	'use strict';

	angular
		.module('resize', []);

	angular
		.module('resize')
		.factory('resize', resize);

	/**
	 * Usage:
	 *
	 * angular.module('myApp', ['resize']);
	 *
	 * var rs = resize.init({
	 *      scope: $scope,
	 *      resizedFn: function() { //window was resized! },
	 *      debounce: 200
	 * });
	 */

	resize.$inject = ['$window', '$timeout'];

	/**
	 * Resize factory
	 *
	 * @param $window
	 * @param $timeout
	 * @returns {object}
	 */
	function resize($window, $timeout) {

		/**
		 * Resize constructor object
		 * @type {{buildInstance: buildInstance}}
		 */
		var Resize = {
			buildInstance: buildInstance
		};

		function buildInstance(options) {
			var _$scope = options['scope'];
			var _oDebounce = options['debounce'];
			var _$win = angular.element($window);
			var _debounceSpeed = !!_oDebounce || _oDebounce === 0 ? _oDebounce : 100;
			var _resizedFn = typeof options.resizedFn === 'function' ? options.resizedFn : null;
			var _debounceResize;

			/**
			 * Bind resize event to window
			 */
			function _resizeHandler() {
				$timeout.cancel(_debounceResize);
				_debounceResize = $timeout(_resizedFn, _debounceSpeed);
			}

			// run initial resize
			_resizeHandler();

			// bind height calculation to window resize
			_$win.bind('resize', _resizeHandler);

			if (_$scope) {
				_$scope.$on('$destroy', function() {
					_$win.unbind('resize', _resizeHandler);
				});
			}
		}

		/**
		 * Return constructor to assign and use
		 *
		 * @param options {object}
		 * @returns {object} Resize
		 */
		function init(options) {
			var RS = Object.create(Resize);

			RS.buildInstance(options);

			return RS;
		}

		return {
			init: init
		}
	}
})();