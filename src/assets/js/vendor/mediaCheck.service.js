(function() {
	'use strict';

	angular.module('mediaCheck', []).service('mediaCheck', ['$window', '$timeout', function($window, $timeout) {
		this.init = function(options) {
			var $scope = options['scope'],
				query = options['mq'],
				debounce = options['debounce'],
				$win = angular.element($window),
				breakpoints,
				createListener = void 0,
				hasMatchMedia = $window.matchMedia !== undefined && !!$window.matchMedia('!').addListener,
				mqListListener,
				mmListener,
				debounceResize,
				mq = void 0,
				mqChange = void 0,
				debounceSpeed = !!debounce || debounce === 0 ? debounce : 250;

			function timeoutFn(fn, mq) {
				if (typeof fn === 'function') {
					$timeout(function() {
						fn(mq);
					});
				}
			}

			if (hasMatchMedia) {
				mqChange = function(mq) {
					if (mq.matches) {
						timeoutFn(options.enter, mq);
					} else {
						timeoutFn(options.exit, mq);
					}
					timeoutFn(options.change, mq);
				};

				createListener = function() {
					mq = $window.matchMedia(query);
					mqListListener = function() { return mqChange(mq) };

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

					return mqChange(mq);
				};

				return createListener();

			} else {
				breakpoints = {};

				mqChange = function(mq) {
					if (mq.matches) {
						if (!!breakpoints[query] === false) {
							timeoutFn(options.enter, mq);
						}
					} else {
						if (breakpoints[query] === true || breakpoints[query] == null) {
							timeoutFn(options.exit, mq);
						}
					}

					if ((mq.matches && (!breakpoints[query]) || (!mq.matches && (breakpoints[query] === true || breakpoints[query] == null)))) {
						timeoutFn(options.change, mq);
					}

					return breakpoints[query] = mq.matches;
				};

				var convertEmToPx = function(value) {
					var emElement = document.createElement('div');

					emElement.style.width = '1em';
					emElement.style.position = 'absolute';
					document.body.appendChild(emElement);
					document.body.removeChild(emElement);

					return value * emElement.offsetWidth;
				};

				var getPXValue = function(width, unit) {
					var value;
					value = void 0;
					switch (unit) {
						case 'em':
							value = convertEmToPx(width);
							break;
						default:
							value = width;
					}
					return value;
				};

				breakpoints[query] = null;

				mmListener = function() {
					var parts = query.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/),
						constraint = parts[1],
						value = getPXValue(parseInt(parts[2], 10), parts[3]),
						fakeMatchMedia = {},
						windowWidth = $window.innerWidth || document.documentElement.clientWidth;

					fakeMatchMedia.matches = constraint === 'max' && value > windowWidth || constraint === 'min' && value < windowWidth;

					return mqChange(fakeMatchMedia);
				};

				var fakeMatchMediaResize = function() {
					$timeout.cancel(debounceResize);
					debounceResize = $timeout(mmListener, debounceSpeed);
				};

				$win.bind('resize', fakeMatchMediaResize);

				if ($scope) {
					$scope.$on('$destroy', function() {
						$win.unbind('resize', fakeMatchMediaResize);
					});
				}

				return mmListener();
			}
		};
	}]);
})();