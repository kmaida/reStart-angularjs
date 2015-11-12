(function() {
	'use strict';

	angular
		.module('resize', []);

	angular
		.module('resize')
		.service('resize', resize);

	/**
	 * Usage:
	 *
	 * angular.module('myApp', ['resize']);
	 *
	 * resize.init({
	 *      scope: $scope,
	 *      resizedFn: function() { //window was resized! },
	 *      debounce: 200
	 * });
	 */

	resize.$inject = ['$window', '$timeout'];

	function resize($window, $timeout) {
		this.init = function(options) {
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
		};
	}
})();