(function() {
	'use strict';

	angular
		.module('mediaCheck', []);  // module setter

	angular
		.module('mediaCheck')   // module getter
		.factory('mediaCheck', mediaCheck); // factory

	// inject dependencies
	mediaCheck.$inject = ['$window', '$timeout'];

	/**
	 * mediaCheck factory function
	 *
	 * @param $window
	 * @param $timeout
	 * @returns {object}
	 */
	function mediaCheck($window, $timeout) {
		var hasMatchMedia = $window.matchMedia !== undefined && !!$window.matchMedia('!').addListener;

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

		/**
		 * MediaCheck constructor function
		 *
		 * @param options {object}
		 * @constructor
		 */
		var MediaCheck = {
			buildInstance: buildInstance,
			matchCurrent: matchCurrent
		};

		function buildInstance(options) {
			this.options = options;
			this.matchMap = {};

			// local variables
			var setup = this.options;
			var matchMap = this.matchMap;
			var media = setup['media'];
			var optionsIsArr = Object.prototype.toString.call(media) === '[object Array]';
			var $scope = setup['scope'];
			var debounce = setup['debounce'];
			var debounceSpeed = !!debounce || debounce === 0 ? debounce : 150;
			var $win = angular.element($window);

			/**
			 * Setup mediaquery
			 *
			 * @param options {object}
			 * @returns {*}
			 * @private
			 */
			function _setupMQ(options) {
				// general
				var query = options['mq'];
				// media query changing functions
				var enterFn = options.enter;
				var exitFn = options.exit;
				var changeFn = options.change;

				/**
				 * matchMedia supported
				 * Use matchMedia to listen for breakpoint changes
				 *
				 * @returns {*} create listener
				 */
				function _mmSupported() {
					var mq = $window.matchMedia(query);

					/**
					 * Check for matches
					 * Run functions appropriately
					 *
					 * @param mq {object} MediaQueryList object
					 */
					function _mqChange(mq) {
						if (mq.matches) {
							_timeoutFn(enterFn, mq);
						} else {
							_timeoutFn(exitFn, mq);
						}
						_timeoutFn(changeFn, mq);
					}

					/**
					 * Set up matchCurrent (matchMedia supported)
					 * Run proper function for current breakpoint
					 * Run _mqChange on-demand
					 */
					function matchCurrent() {
						_mqChange(mq);
					}

					// matchMap function mapping for matchCurrent()
					matchMap[query] = matchCurrent;

					/**
					 * Create listener for media query changes
					 * Bind to orientation change
					 * Unbind on $scope destruction
					 */
					function _createListener() {
						/**
						 * Create matchMedia listener when matchMedia is supported
						 *
						 * @returns {*} _mqChange function
						 */
						function _mqListListener() {
							return _mqChange(mq)
						}

						mq.addListener(_mqListListener);

						// bind to the orientationchange event and fire _mqChange
						$win.bind('orientationchange', _mqListListener);

						// cleanup listeners when $scope is $destroyed
						if ($scope) {
							$scope.$on('$destroy', function() {
								mq.removeListener(_mqListListener);
								$win.unbind('orientationchange', _mqListListener);
								matchMap = {};
							});
						}

						return _mqChange(mq);
					}

					return _createListener();
				}

				/**
				 * matchMedia not supported
				 * Use window resize to listen for breakpoint changes
				 *
				 * @returns {*} create listener
				 */
				function _mmNotSupported() {
					var breakpoints = {};
					var debounceResize;

					/**
					 * Check for matches
					 * Run functions appropriately
					 *
					 * @param mq {object}
					 * @returns {*} set breakpoint matching boolean
					 */
					function _mqChange(mq) {
						if (mq.matches) {
							if (!!breakpoints[query] === false) {
								_timeoutFn(enterFn, mq);
							}
						} else {
							if (breakpoints[query] === true || breakpoints[query] == null) {
								_timeoutFn(exitFn, mq);
							}
						}

						if ((mq.matches && (!breakpoints[query]) || (!mq.matches && (breakpoints[query] === true || breakpoints[query] == null)))) {
							_timeoutFn(changeFn, mq);
						}

						return breakpoints[query] = mq.matches;
					}

					breakpoints[query] = null;

					/**
					 * Create matchMedia listener when matchMedia not supported
					 *
					 * @returns {*} _mqChange function
					 */
					function _mmListener() {
						var parts = query.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/);
						var constraint = parts[1];
						var value = _getPXValue(parseInt(parts[2], 10), parts[3]);
						var fakeMatchMedia = { media: query };
						var windowWidth = $window.innerWidth || document.documentElement.clientWidth;

						fakeMatchMedia.matches = constraint === 'max' && value > windowWidth || constraint === 'min' && value < windowWidth;

						return _mqChange(fakeMatchMedia);
					}

					/**
					 * Set up matchCurrent (matchMedia not supported)
					 * Run proper function for current breakpoint
					 */
					function matchCurrent() {
						var mq = {
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

					// matchMap function mapping for matchCurrent()
					matchMap[query] = matchCurrent;

					/**
					 * Window resized
					 */
					function _fakeMatchMediaResize() {
						$timeout.cancel(debounceResize);
						debounceResize = $timeout(_mmListener, debounceSpeed);
					}

					$win.bind('resize', _fakeMatchMediaResize);

					if ($scope) {
						$scope.$on('$destroy', function() {
							$win.unbind('resize', _fakeMatchMediaResize);
							matchMap = {};
						});
					}

					return _mmListener();
				}

				if (hasMatchMedia) {
					// Modern browser supports matchMedia
					_mmSupported();
				} else {
					// Browser does not support matchMedia (<=IE9, IE Mobile)
					_mmNotSupported();
				}
			}

			// Run setup function
			if (optionsIsArr) {
				for (var i = 0; i < media.length; i++) {
					var optionsItem = media[i];

					if (typeof optionsItem === 'object') {
						_setupMQ(optionsItem);
					}
				}
			} else if (!optionsIsArr && typeof media === 'object') {
				_setupMQ(media);
			}
		}

		/**
		 * matchCurrent() method
		 *
		 * @param matchQuery {string} optional
		 */
		function matchCurrent(matchQuery) {
			var matchMap = this.matchMap;

			if (matchQuery) {
				if (typeof matchMap[matchQuery] === 'function') {
					matchMap[matchQuery]();
				} else {
					throw new Error('Requested mediaquery not found in mediaCheck');
				}
			} else {
				angular.forEach(matchMap, function(value, key) {
					value();
				});
			}
		}

		/**
		 * Return constructor to assign and use
		 *
		 * @param options {object} options
		 * @returns {MediaCheck}
		 */
		function init(options) {
			var MC = Object.create(MediaCheck);

			MC.buildInstance(options);

			return MC;
		}

		// CALLABLE MEMBERS
		return {
			init: init
		};
	}
})();