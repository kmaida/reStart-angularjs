(function() {
	'use strict';

	angular.module('mediaCheck', []).service('mediaCheck', ['$window', '$timeout', function($window, $timeout) {
		var self = this;
		var hasMatchMedia = $window.matchMedia !== undefined && !!$window.matchMedia('!').addListener;

		self.globals = {
			query: null,
			mqChange: void 0,
			breakpoints: null,
			mmListener: null,
			enterFn: null,
			exitFn: null,
			changeFn: null
		};

		/**
		 * Wrap handlers in $timeout
		 * to prevent $digest errors
		 *
		 * @param fn {function}
		 * @param mq {object} matchMedia query
		 * @private
		 */
		function _timeoutFn(fn, mq) {
			if (typeof fn === 'function') {
				$timeout(function() {
					fn(mq);
				});
			}
		}

		/**
		 * INIT method
		 *
		 * @param options {object}
		 * @returns {*}
		 * @public
		 */
		self.init = function(options) {
			var $scope = options['scope'];
			var debounce = options['debounce'];
			var $win = angular.element($window);
			var createListener = void 0;
			var mqListListener;
			var debounceResize;
			var mq = void 0;
			var debounceSpeed = !!debounce || debounce === 0 ? debounce : 250;

			// set global variables from init options
			self.globals.query = options['mq'];
			self.globals.enterFn = options.enter;
			self.globals.exitFn = options.exit;
			self.globals.changeFn = options.change;

			// get newly-set global variables to use here
			var query = self.globals.query;
			var enterFn = self.globals.enterFn;
			var exitFn = self.globals.exitFn;
			var changeFn = self.globals.changeFn;

			/**
			 * Convert ems to px
			 *
			 * @param value {number}
			 * @returns {number}
			 * @private
			 */
			function _convertEmToPx(value) {
				var emElement = document.createElement('div');

				emElement.style.width = '1em';
				emElement.style.position = 'absolute';
				document.body.appendChild(emElement);
				document.body.removeChild(emElement);

				return value * emElement.offsetWidth;
			}

			/**
			 * Get pixel value
			 *
			 * @param width {number}
			 * @param unit {string}
			 * @returns {string}
			 * @private
			 */
			function _getPXValue(width, unit) {
				var value;
				value = void 0;
				switch (unit) {
					case 'em':
						value = _convertEmToPx(width);
						break;
					default:
						value = width;
				}
				return value;
			}

			// Modern browser supports matchMedia
			if (hasMatchMedia) {
				self.globals.mqChange = function(mq) {
					if (mq.matches) {
						_timeoutFn(enterFn, mq);
					} else {
						_timeoutFn(exitFn, mq);
					}
					_timeoutFn(changeFn, mq);
				};

				createListener = function() {
					mq = $window.matchMedia(query);
					mqListListener = function() { return self.globals.mqChange(mq) };

					mq.addListener(mqListListener);

					// bind to the orientationchange event and fire mqChange
					$win.bind('orientationchange', mqListListener);

					// cleanup listeners when $scope is $destroyed
					if ($scope) {
						$scope.$on('$destroy', function() {
							mq.removeListener(mqListListener);
							$win.unbind('orientationchange', mqListListener);
						});
					}

					return self.globals.mqChange(mq);
				};

				return createListener();

				// Browser does not support matchMedia (<=IE9, IE Mobile)
			} else {
				self.globals.breakpoints = {};

				self.globals.mqChange = function(mq) {
					if (mq.matches) {
						if (!!self.globals.breakpoints[query] === false) {
							_timeoutFn(enterFn, mq);
						}
					} else {
						if (self.globals.breakpoints[query] === true || self.globals.breakpoints[query] == null) {
							_timeoutFn(exitFn, mq);
						}
					}

					if ((mq.matches && (!self.globals.breakpoints[query]) || (!mq.matches && (self.globals.breakpoints[query] === true || self.globals.breakpoints[query] == null)))) {
						_timeoutFn(changeFn, mq);
					}

					return self.globals.breakpoints[query] = mq.matches;
				};

				self.globals.breakpoints[query] = null;

				self.globals.mmListener = function() {
					var parts = query.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/);
					var constraint = parts[1];
					var value = _getPXValue(parseInt(parts[2], 10), parts[3]);
					var fakeMatchMedia = {};
					var windowWidth = $window.innerWidth || document.documentElement.clientWidth;

					fakeMatchMedia.matches = constraint === 'max' && value > windowWidth || constraint === 'min' && value < windowWidth;

					return self.globals.mqChange(fakeMatchMedia);
				};

				var fakeMatchMediaResize = function() {
					$timeout.cancel(debounceResize);
					debounceResize = $timeout(self.globals.mmListener, debounceSpeed);
				};

				$win.bind('resize', fakeMatchMediaResize);

				if ($scope) {
					$scope.$on('$destroy', function() {
						$win.unbind('resize', fakeMatchMediaResize);
					});
				}

				return self.globals.mmListener();
			}
		};

		/**
		 * MATCHCURRENT method
		 * Check for media query match
		 * Must be executed after init() method called
		 */
		self.matchCurrent = function() {
			var mq;
			var query = self.globals.query;
			var enterFn = self.globals.enterFn;
			var exitFn = self.globals.exitFn;
			var changeFn = self.globals.changeFn;
			var breakpoints = self.globals.breakpoints;

			if (query && typeof self.globals.mqChange === 'function') {
				if (hasMatchMedia) {
					mq = $window.matchMedia(query);

					self.globals.mqChange(mq);
				} else {
					if (breakpoints) {
						mq = {
							media: query,
							matches: breakpoints[query]
						};

						if (breakpoints[query]) {
							_timeoutFn(enterFn, mq);
						} else {
							_timeoutFn(exitFn, mq);
						}
						_timeoutFn(changeFn, mq);
					}
				}
			} else {
				throw new Error('mediaCheck must be initialized before mediaCheck.match() can be used.');
			}
		};
	}]);
})();