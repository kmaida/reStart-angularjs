angular
	.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck']);
// "global" object to share between controllers
(function() {
	'use strict';

	angular
		.module('myApp')
		.factory('GlobalObj', GlobalObj);

	function GlobalObj() {
		var greeting = 'Hello';

		/**
		 * Say hello
		 */
		function sayHello() {
			alert(greeting);
		}

		// callable members
		return {
			greeting: greeting,
			sayHello: sayHello
		};
	}
})();
// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('myApp')
		.factory('JSONData', JSONData);

	JSONData.$inject = ['$http'];

	function JSONData($http) {
		/**
		 * Promise response function - success
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 *
		 * @param response {*} data from $http
		 * @returns {object|Array}
		 * @private
		 */
		function _successRes(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				throw new Error('retrieved data is not typeof object.');
			}
		}

		/**
		 * Promise response function - error
		 * Throws an error with error data
		 *
		 * @param error {object}
		 * @private
		 */
		function _errorRes(error) {
			throw new Error('error retrieving data', error);
		}

		/**
		 * GET local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getLocalData() {
			return $http
				.get('/ng-app/data/data.json')
				.then(_successRes, _errorRes);
		}

		// callable members
		return {
			getLocalData: getLocalData
		}
	}
})();
(function() {
	'use strict';

	// media query constants
	var MQ = {
		SMALL: '(max-width: 767px)',
		LARGE: '(min-width: 768px)'
	};

	angular
		.module('myApp')
		.constant('MQ', MQ);
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['$scope', 'Page'];

	function PageCtrl($scope, Page) {
		var page = this;

		// associate page <title>
		page.pageTitle = Page;
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.factory('Page', Page);

	function Page() {
		var pageTitle = 'Home';

		function title() {
			return pageTitle;
		}

		function setTitle(newTitle) {
			pageTitle = newTitle;
		}

		return {
			title: title,
			setTitle: setTitle
		}
	}
})();
// config
(function() {
	'use strict';

	angular
		.module('myApp')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'ng-app/home/Home.view.html',
				controller: 'HomeCtrl',
				controllerAs: 'home',
				resolve: {
					resolveLocalData: resolveLocalData
				}
			})
			.when('/subpage', {
				templateUrl: 'ng-app/sub/Sub.view.html',
				controller: 'SubCtrl',
				controllerAs: 'sub',
				resolve: {
					resolveLocalData: resolveLocalData
				}
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}

	resolveLocalData.$inject = ['JSONData'];
	/**
	 * Get local data for route resolve
	 *
	 * @param JSONData {factory}
	 * @returns {promise}
	 */
	function resolveLocalData(JSONData) {
		return JSONData.getLocalData();
	}
})();
(function() {
	'use strict';

	var angularMediaCheck = angular.module('mediaCheck', []);

	angularMediaCheck.service('mediaCheck', ['$window', '$timeout', function ($window, $timeout) {
		this.init = function (options) {
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
				debounceSpeed = !!debounce ? debounce : 250;

			if (hasMatchMedia) {
				mqChange = function (mq) {
					if (mq.matches && typeof options.enter === 'function') {
						options.enter(mq);
					} else {
						if (typeof options.exit === 'function') {
							options.exit(mq);
						}
					}
					if (typeof options.change === 'function') {
						options.change(mq);
					}
				};

				createListener = function () {
					mq = $window.matchMedia(query);
					mqListListener = function () {
						return mqChange(mq)
					};

					mq.addListener(mqListListener);

					// bind to the orientationchange event and fire mqChange
					$win.bind('orientationchange', mqListListener);

					// cleanup listeners when $scope is $destroyed
					$scope.$on('$destroy', function () {
						mq.removeListener(mqListListener);
						$win.unbind('orientationchange', mqListListener);
					});

					return mqChange(mq);
				};

				return createListener();

			} else {
				breakpoints = {};

				mqChange = function (mq) {
					if (mq.matches) {
						if (!!breakpoints[query] === false && (typeof options.enter === 'function')) {
							options.enter(mq);
						}
					} else {
						if (breakpoints[query] === true || breakpoints[query] == null) {
							if (typeof options.exit === 'function') {
								options.exit(mq);
							}
						}
					}

					if ((mq.matches && (!breakpoints[query]) || (!mq.matches && (breakpoints[query] === true || breakpoints[query] == null)))) {
						if (typeof options.change === 'function') {
							options.change(mq);
						}
					}

					return breakpoints[query] = mq.matches;
				};

				var convertEmToPx = function (value) {
					var emElement = document.createElement('div');

					emElement.style.width = '1em';
					emElement.style.position = 'absolute';
					document.body.appendChild(emElement);
					px = value * emElement.offsetWidth;
					document.body.removeChild(emElement);

					return px;
				};

				var getPXValue = function (width, unit) {
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

				mmListener = function () {
					var parts = query.match(/\((.*)-.*:\s*([\d\.]*)(.*)\)/),
						constraint = parts[1],
						value = getPXValue(parseInt(parts[2], 10), parts[3]),
						fakeMatchMedia = {},
						windowWidth = $window.innerWidth || document.documentElement.clientWidth;

					fakeMatchMedia.matches = constraint === 'max' && value > windowWidth || constraint === 'min' && value < windowWidth;

					return mqChange(fakeMatchMedia);
				};

				var fakeMatchMediaResize = function () {
					$timeout.cancel(debounceResize);
					debounceResize = $timeout(mmListener, debounceSpeed);
				};

				$win.bind('resize', fakeMatchMediaResize);

				$scope.$on('$destroy', function () {
					$win.unbind('resize', fakeMatchMediaResize);
				});

				return mmListener();
			}
		};
	}]);
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('routeLoading', routeLoading);

	/**
	 * routeLoading directive
	 * Sample directive with isolate scope,
	 * controller, link, transclusion
	 *
	 * @returns {object} directive
	 */
	function routeLoading() {
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'ng-app/core/routeLoading.tpl.html',
			transclude: true,
			controller: routeLoadingCtrl,
			controllerAs: 'loading',
			bindToController: true
		};
	}

	routeLoadingCtrl.$inject = ['$scope'];
	/**
	 * routeLoading CONTROLLER
	 */
	function routeLoadingCtrl($scope) {
		var loading = this;

		// for first page load
		loading.active = true;

		$scope.$on('$routeChangeStart', function($event, next, current) {
			loading.active = true;
		});

		$scope.$on('$routeChangeSuccess', function($event, current, previous) {
			loading.active = false;
		});

		$scope.$on('$routeChangeError', function($event, current, previous, rejection) {
			loading.active = false;
		});
	}

})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.filter('trustAsHTML', trustAsHTML);

	trustAsHTML.$inject = ['$sce'];

	function trustAsHTML($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}
})();
// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('viewSwitch', viewSwitch);

	viewSwitch.$inject = ['mediaCheck', 'MQ', '$timeout'];

	function viewSwitch(mediaCheck, MQ, $timeout) {

		viewSwitchLink.$inject = ['$scope'];

		function viewSwitchLink($scope) {
			// data object
			$scope.vs = {};

			/**
			 * Function to run on enter media query
			 *
			 * @param {object} mq media query
 			 */
			function _enterFn(mq) {
				$timeout(function() {
					$scope.vs.viewformat = 'small';
				});
			}

			/**
			 * Function to run on exit media query
			 *
			 * @param {object} mq media query
			 */
			function _exitFn(mq) {
				$timeout(function() {
					$scope.vs.viewformat = 'large';
				});
			}

			// initialize mediaCheck
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: _enterFn,
				exit: _exitFn
			});
		}

		return {
			restrict: 'EA',
			link: viewSwitchLink
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HeaderCtrl', HeaderCtrl);

	HeaderCtrl.$inject = ['$scope', '$location', 'JSONData'];

	function HeaderCtrl($scope, $location, JSONData) {
		// controllerAs ViewModel
		var header = this;

		// bindable members
		header.indexIsActive = indexIsActive;
		header.navIsActive = navIsActive;

		/**
		 * Successful promise data
		 *
		 * @param data {json}
		 * @private
		 */
		function _getJsonSuccess(data) {
			header.json = data;
		}

		// get the data from JSON
		JSONData.getLocalData().then(_getJsonSuccess);

		/**
		 * Apply class to index nav if active
		 *
		 * @param {string} path
 		 */
		function indexIsActive(path) {
			// path should be '/'
			return $location.path() === path;
		}

		/**
		 * Apply class to currently active nav item
		 *
		 * @param {string} path
		 */
		 function navIsActive(path) {
			return $location.path().substr(0, path.length) === path;
		}
	}

})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('navControl', navControl);

	navControl.$inject = ['mediaCheck', 'MQ', '$timeout', '$window'];

	function navControl(mediaCheck, MQ, $timeout, $window) {

		navControlLink.$inject = ['$scope', '$element', '$attrs'];

		function navControlLink($scope) {
			// data object
			$scope.nav = {};

			var _win = angular.element($window);
			var _body = angular.element('body');
			var _layoutCanvas = _body.find('.layout-canvas');
			var _navOpen;
			var _debounceResize;

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_layoutCanvas.css('min-height', $window.innerHeight + 'px');
			}

			/**
			 * Bind resize event to window
			 * Apply min-height to layout to
			 * make nav full-height
			 */
			function _layoutHeight() {
				$timeout.cancel(_debounceResize);
				_debounceResize = $timeout(_resized, 200);
			}

			// run initial layout height calculation
			_layoutHeight();

			// bind height calculation to window resize
			_win.bind('resize', _layoutHeight);

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_body
				.removeClass('nav-closed')
				.addClass('nav-open');

				_navOpen = true;
			}

			/**
			 * Close mobile navigation
			 *
			 * @private
			 */
			function _closeNav() {
				_body
				.removeClass('nav-open')
				.addClass('nav-closed');

				_navOpen = false;
			}

			/**
			 * Function to execute when entering mobile media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _enterMobile() {
				_closeNav();

				$timeout(function () {
					// toggle mobile navigation open/closed
					$scope.nav.toggleNav = function () {
						if (!_navOpen) {
							_openNav();
						} else {
							_closeNav();
						}
					};
				});

				$scope.$on('$locationChangeStart', _closeNav);
			}

			/**
			 * Function to execute when exiting mobile media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _exitMobile() {
				$timeout(function () {
					$scope.nav.toggleNav = null;
				});

				_body.removeClass('nav-closed nav-open');
			}

			/**
			 * Unbind resize listener on destruction of scope
			 */
			$scope.$on('$destroy', function() {
				win.unbind('resize', _layoutHeight);
			});

			// Set up functionality to run on enter/exit of media query
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			});
		}

		return {
			restrict: 'EA',
			link: navControlLink
		};
	}

})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['GlobalObj', 'Page', 'resolveLocalData'];

	function HomeCtrl(GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.global = GlobalObj;
		home.name = 'Visitor';
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';

		// set page <title>
		Page.setTitle('Home');

		// data from route resolve
		home.json = resolveLocalData;
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['GlobalObj', 'Page', 'resolveLocalData'];

	function SubCtrl(GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var sub = this;

		// bindable members
		sub.global = GlobalObj;

		// set page <title>
		Page.setTitle('Subpage');

		// data from route resolve
		sub.json = resolveLocalData;
	}

})();
// Directives (and associated attributes) are camelCase in JS and snake-case in HTML
// Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
// Complex JavaScript DOM manipulation should always be done in directive link functions, and $apply should never be used in a controller! Simple DOM manipulation should be in the view.

/*--- Sample Directive with a $watch ---*/
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('sampleDirective', sampleDirective);

	sampleDirective.$inject = ['$timeout'];
	/**
	 * sampleDirective directive
	 * Sample directive with isolate scope,
	 * controller, link, transclusion
	 *
	 * @returns {object} directive
	 */
	function sampleDirective($timeout) {

		sampleDirectiveLink.$inject = ['$scope', '$element', '$attrs', 'sd'];
		/**
		 * sampleDirective LINK function
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param sd {controller}
		 */
		function sampleDirectiveLink($scope, $element, $attrs, sd) {
			// watch for async data to become available and update
			$scope.$watch('sd.jsonData', function(newVal, oldVal) {
				if (newVal) {
					sd.jsonData = newVal;

					$timeout(function() {
						console.log('hi');
					}, 1000);
				}
			});
		}

		return {
			restrict: 'EA',
			replace: true,
			scope: {
				jsonData: '='
			},
			templateUrl: 'ng-app/sub/sample.tpl.html',
			transclude: true,
			controller: SampleDirectiveCtrl,
			controllerAs: 'sd',
			bindToController: true,
			link: sampleDirectiveLink
		};
	}

	SampleDirectiveCtrl.$inject = [];
	/**
	 * sampleDirective CONTROLLER
	 */
	function SampleDirectiveCtrl() {
		var sd = this;
	}

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL0dsb2JhbE9iai5mYWN0b3J5LmpzIiwiY29yZS9KU09ORGF0YS5mYWN0b3J5LmpzIiwiY29yZS9NUS5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL2FwcC5jb25maWcuanMiLCJjb3JlL21lZGlhQ2hlY2suc2VydmljZS5qcyIsImNvcmUvcm91dGVMb2FkaW5nLmRpci5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwic3ViL1N1Yi5jdHJsLmpzIiwic3ViL3NhbXBsZS5kaXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdteUFwcCcsIFsnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nU2FuaXRpemUnLCAnbWVkaWFDaGVjayddKTsiLCIvLyBcImdsb2JhbFwiIG9iamVjdCB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCdHbG9iYWxPYmonLCBHbG9iYWxPYmopO1xuXG5cdGZ1bmN0aW9uIEdsb2JhbE9iaigpIHtcblx0XHR2YXIgZ3JlZXRpbmcgPSAnSGVsbG8nO1xuXG5cdFx0LyoqXG5cdFx0ICogU2F5IGhlbGxvXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc2F5SGVsbG8oKSB7XG5cdFx0XHRhbGVydChncmVldGluZyk7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRncmVldGluZzogZ3JlZXRpbmcsXG5cdFx0XHRzYXlIZWxsbzogc2F5SGVsbG9cblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIGZldGNoIEpTT04gZGF0YSB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCdKU09ORGF0YScsIEpTT05EYXRhKTtcblxuXHRKU09ORGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIEpTT05EYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIHN1Y2Nlc3Ncblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fEFycmF5fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3N1Y2Nlc3NSZXMocmVzcG9uc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2Vycm9yUmVzKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ2Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHRVQgbG9jYWwgSlNPTiBkYXRhIGZpbGUgYW5kIHJldHVybiByZXN1bHRzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRMb2NhbERhdGEoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL25nLWFwcC9kYXRhL2RhdGEuanNvbicpXG5cdFx0XHRcdC50aGVuKF9zdWNjZXNzUmVzLCBfZXJyb3JSZXMpO1xuXHRcdH1cblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TG9jYWxEYXRhOiBnZXRMb2NhbERhdGFcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29uc3RhbnQoJ01RJywgTVEpO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKCRzY29wZSwgUGFnZSkge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZmFjdG9yeSgnUGFnZScsIFBhZ2UpO1xuXG5cdGZ1bmN0aW9uIFBhZ2UoKSB7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdIb21lJztcblxuXHRcdGZ1bmN0aW9uIHRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBjb25maWdcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJyxcblx0XHRcdFx0cmVzb2x2ZToge1xuXHRcdFx0XHRcdHJlc29sdmVMb2NhbERhdGE6IHJlc29sdmVMb2NhbERhdGFcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvc3VicGFnZScsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvc3ViL1N1Yi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnU3ViQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3N1YicsXG5cdFx0XHRcdHJlc29sdmU6IHtcblx0XHRcdFx0XHRyZXNvbHZlTG9jYWxEYXRhOiByZXNvbHZlTG9jYWxEYXRhXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy8nXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cblxuXHRyZXNvbHZlTG9jYWxEYXRhLiRpbmplY3QgPSBbJ0pTT05EYXRhJ107XG5cdC8qKlxuXHQgKiBHZXQgbG9jYWwgZGF0YSBmb3Igcm91dGUgcmVzb2x2ZVxuXHQgKlxuXHQgKiBAcGFyYW0gSlNPTkRhdGEge2ZhY3Rvcnl9XG5cdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzb2x2ZUxvY2FsRGF0YShKU09ORGF0YSkge1xuXHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgYW5ndWxhck1lZGlhQ2hlY2sgPSBhbmd1bGFyLm1vZHVsZSgnbWVkaWFDaGVjaycsIFtdKTtcblxuXHRhbmd1bGFyTWVkaWFDaGVjay5zZXJ2aWNlKCdtZWRpYUNoZWNrJywgWyckd2luZG93JywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCR3aW5kb3csICR0aW1lb3V0KSB7XG5cdFx0dGhpcy5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdHZhciAkc2NvcGUgPSBvcHRpb25zWydzY29wZSddLFxuXHRcdFx0XHRxdWVyeSA9IG9wdGlvbnNbJ21xJ10sXG5cdFx0XHRcdGRlYm91bmNlID0gb3B0aW9uc1snZGVib3VuY2UnXSxcblx0XHRcdFx0JHdpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KSxcblx0XHRcdFx0YnJlYWtwb2ludHMsXG5cdFx0XHRcdGNyZWF0ZUxpc3RlbmVyID0gdm9pZCAwLFxuXHRcdFx0XHRoYXNNYXRjaE1lZGlhID0gJHdpbmRvdy5tYXRjaE1lZGlhICE9PSB1bmRlZmluZWQgJiYgISEkd2luZG93Lm1hdGNoTWVkaWEoJyEnKS5hZGRMaXN0ZW5lcixcblx0XHRcdFx0bXFMaXN0TGlzdGVuZXIsXG5cdFx0XHRcdG1tTGlzdGVuZXIsXG5cdFx0XHRcdGRlYm91bmNlUmVzaXplLFxuXHRcdFx0XHRtcSA9IHZvaWQgMCxcblx0XHRcdFx0bXFDaGFuZ2UgPSB2b2lkIDAsXG5cdFx0XHRcdGRlYm91bmNlU3BlZWQgPSAhIWRlYm91bmNlID8gZGVib3VuY2UgOiAyNTA7XG5cblx0XHRcdGlmIChoYXNNYXRjaE1lZGlhKSB7XG5cdFx0XHRcdG1xQ2hhbmdlID0gZnVuY3Rpb24gKG1xKSB7XG5cdFx0XHRcdFx0aWYgKG1xLm1hdGNoZXMgJiYgdHlwZW9mIG9wdGlvbnMuZW50ZXIgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuZW50ZXIobXEpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZXhpdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmV4aXQobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmNoYW5nZShtcSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNyZWF0ZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG1xID0gJHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KTtcblx0XHRcdFx0XHRtcUxpc3RMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShtcSlcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0bXEuYWRkTGlzdGVuZXIobXFMaXN0TGlzdGVuZXIpO1xuXG5cdFx0XHRcdFx0Ly8gYmluZCB0byB0aGUgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQgYW5kIGZpcmUgbXFDaGFuZ2Vcblx0XHRcdFx0XHQkd2luLmJpbmQoJ29yaWVudGF0aW9uY2hhbmdlJywgbXFMaXN0TGlzdGVuZXIpO1xuXG5cdFx0XHRcdFx0Ly8gY2xlYW51cCBsaXN0ZW5lcnMgd2hlbiAkc2NvcGUgaXMgJGRlc3Ryb3llZFxuXHRcdFx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0bXEucmVtb3ZlTGlzdGVuZXIobXFMaXN0TGlzdGVuZXIpO1xuXHRcdFx0XHRcdFx0JHdpbi51bmJpbmQoJ29yaWVudGF0aW9uY2hhbmdlJywgbXFMaXN0TGlzdGVuZXIpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIG1xQ2hhbmdlKG1xKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXR1cm4gY3JlYXRlTGlzdGVuZXIoKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnJlYWtwb2ludHMgPSB7fTtcblxuXHRcdFx0XHRtcUNoYW5nZSA9IGZ1bmN0aW9uIChtcSkge1xuXHRcdFx0XHRcdGlmIChtcS5tYXRjaGVzKSB7XG5cdFx0XHRcdFx0XHRpZiAoISFicmVha3BvaW50c1txdWVyeV0gPT09IGZhbHNlICYmICh0eXBlb2Ygb3B0aW9ucy5lbnRlciA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5lbnRlcihtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChicmVha3BvaW50c1txdWVyeV0gPT09IHRydWUgfHwgYnJlYWtwb2ludHNbcXVlcnldID09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmV4aXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLmV4aXQobXEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKChtcS5tYXRjaGVzICYmICghYnJlYWtwb2ludHNbcXVlcnldKSB8fCAoIW1xLm1hdGNoZXMgJiYgKGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PT0gdHJ1ZSB8fCBicmVha3BvaW50c1txdWVyeV0gPT0gbnVsbCkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmNoYW5nZShtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGJyZWFrcG9pbnRzW3F1ZXJ5XSA9IG1xLm1hdGNoZXM7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGNvbnZlcnRFbVRvUHggPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0XHR2YXIgZW1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cblx0XHRcdFx0XHRlbUVsZW1lbnQuc3R5bGUud2lkdGggPSAnMWVtJztcblx0XHRcdFx0XHRlbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZW1FbGVtZW50KTtcblx0XHRcdFx0XHRweCA9IHZhbHVlICogZW1FbGVtZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZW1FbGVtZW50KTtcblxuXHRcdFx0XHRcdHJldHVybiBweDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZ2V0UFhWYWx1ZSA9IGZ1bmN0aW9uICh3aWR0aCwgdW5pdCkge1xuXHRcdFx0XHRcdHZhciB2YWx1ZTtcblx0XHRcdFx0XHR2YWx1ZSA9IHZvaWQgMDtcblx0XHRcdFx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ2VtJzpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0RW1Ub1B4KHdpZHRoKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHdpZHRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0YnJlYWtwb2ludHNbcXVlcnldID0gbnVsbDtcblxuXHRcdFx0XHRtbUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBwYXJ0cyA9IHF1ZXJ5Lm1hdGNoKC9cXCgoLiopLS4qOlxccyooW1xcZFxcLl0qKSguKilcXCkvKSxcblx0XHRcdFx0XHRcdGNvbnN0cmFpbnQgPSBwYXJ0c1sxXSxcblx0XHRcdFx0XHRcdHZhbHVlID0gZ2V0UFhWYWx1ZShwYXJzZUludChwYXJ0c1syXSwgMTApLCBwYXJ0c1szXSksXG5cdFx0XHRcdFx0XHRmYWtlTWF0Y2hNZWRpYSA9IHt9LFxuXHRcdFx0XHRcdFx0d2luZG93V2lkdGggPSAkd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG5cdFx0XHRcdFx0ZmFrZU1hdGNoTWVkaWEubWF0Y2hlcyA9IGNvbnN0cmFpbnQgPT09ICdtYXgnICYmIHZhbHVlID4gd2luZG93V2lkdGggfHwgY29uc3RyYWludCA9PT0gJ21pbicgJiYgdmFsdWUgPCB3aW5kb3dXaWR0aDtcblxuXHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShmYWtlTWF0Y2hNZWRpYSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGZha2VNYXRjaE1lZGlhUmVzaXplID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCR0aW1lb3V0LmNhbmNlbChkZWJvdW5jZVJlc2l6ZSk7XG5cdFx0XHRcdFx0ZGVib3VuY2VSZXNpemUgPSAkdGltZW91dChtbUxpc3RlbmVyLCBkZWJvdW5jZVNwZWVkKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkd2luLmJpbmQoJ3Jlc2l6ZScsIGZha2VNYXRjaE1lZGlhUmVzaXplKTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkd2luLnVuYmluZCgncmVzaXplJywgZmFrZU1hdGNoTWVkaWFSZXNpemUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gbW1MaXN0ZW5lcigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZGlyZWN0aXZlKCdyb3V0ZUxvYWRpbmcnLCByb3V0ZUxvYWRpbmcpO1xuXG5cdC8qKlxuXHQgKiByb3V0ZUxvYWRpbmcgZGlyZWN0aXZlXG5cdCAqIFNhbXBsZSBkaXJlY3RpdmUgd2l0aCBpc29sYXRlIHNjb3BlLFxuXHQgKiBjb250cm9sbGVyLCBsaW5rLCB0cmFuc2NsdXNpb25cblx0ICpcblx0ICogQHJldHVybnMge29iamVjdH0gZGlyZWN0aXZlXG5cdCAqL1xuXHRmdW5jdGlvbiByb3V0ZUxvYWRpbmcoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2NvcmUvcm91dGVMb2FkaW5nLnRwbC5odG1sJyxcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXG5cdFx0XHRjb250cm9sbGVyOiByb3V0ZUxvYWRpbmdDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9hZGluZycsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlXG5cdFx0fTtcblx0fVxuXG5cdHJvdXRlTG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cdC8qKlxuXHQgKiByb3V0ZUxvYWRpbmcgQ09OVFJPTExFUlxuXHQgKi9cblx0ZnVuY3Rpb24gcm91dGVMb2FkaW5nQ3RybCgkc2NvcGUpIHtcblx0XHR2YXIgbG9hZGluZyA9IHRoaXM7XG5cblx0XHQvLyBmb3IgZmlyc3QgcGFnZSBsb2FkXG5cdFx0bG9hZGluZy5hY3RpdmUgPSB0cnVlO1xuXG5cdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gdHJ1ZTtcblx0XHR9KTtcblxuXHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdH0pO1xuXG5cdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBmdW5jdGlvbigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gZmFsc2U7XG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gRm9yIGV2ZW50cyBiYXNlZCBvbiB2aWV3cG9ydCBzaXplIC0gdXBkYXRlcyBhcyB2aWV3cG9ydCBpcyByZXNpemVkXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5kaXJlY3RpdmUoJ3ZpZXdTd2l0Y2gnLCB2aWV3U3dpdGNoKTtcblxuXHR2aWV3U3dpdGNoLiRpbmplY3QgPSBbJ21lZGlhQ2hlY2snLCAnTVEnLCAnJHRpbWVvdXQnXTtcblxuXHRmdW5jdGlvbiB2aWV3U3dpdGNoKG1lZGlhQ2hlY2ssIE1RLCAkdGltZW91dCkge1xuXG5cdFx0dmlld1N3aXRjaExpbmsuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cblx0XHRmdW5jdGlvbiB2aWV3U3dpdGNoTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUudnMgPSB7fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBydW4gb24gZW50ZXIgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gbXEgbWVkaWEgcXVlcnlcbiBcdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlckZuKG1xKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gcnVuIG9uIGV4aXQgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gbXEgbWVkaWEgcXVlcnlcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRGbihtcSkge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkc2NvcGUudnMudmlld2Zvcm1hdCA9ICdsYXJnZSc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbml0aWFsaXplIG1lZGlhQ2hlY2tcblx0XHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlckZuLFxuXHRcdFx0XHRleGl0OiBfZXhpdEZuXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiB2aWV3U3dpdGNoTGlua1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBIZWFkZXJDdHJsKTtcclxuXHJcblx0SGVhZGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlckN0cmwoJHNjb3BlLCAkbG9jYXRpb24sIEpTT05EYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaGVhZGVyID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGluZGV4SXNBY3RpdmU7XHJcblx0XHRoZWFkZXIubmF2SXNBY3RpdmUgPSBuYXZJc0FjdGl2ZTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRoZWFkZXIuanNvbiA9IGRhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ2V0IHRoZSBkYXRhIGZyb20gSlNPTlxyXG5cdFx0SlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCkudGhlbihfZ2V0SnNvblN1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXBwbHkgY2xhc3MgdG8gaW5kZXggbmF2IGlmIGFjdGl2ZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcbiBcdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbmRleElzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXBwbHkgY2xhc3MgdG8gY3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKi9cclxuXHRcdCBmdW5jdGlvbiBuYXZJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpLnN1YnN0cigwLCBwYXRoLmxlbmd0aCkgPT09IHBhdGg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJ21lZGlhQ2hlY2snLCAnTVEnLCAnJHRpbWVvdXQnLCAnJHdpbmRvdyddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2wobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0LCAkd2luZG93KSB7XG5cblx0XHRuYXZDb250cm9sTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdHZhciBfd2luID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xuXHRcdFx0dmFyIF9ib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX2xheW91dENhbnZhcyA9IF9ib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cdFx0XHR2YXIgX2RlYm91bmNlUmVzaXplO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2l6ZWQgd2luZG93IChkZWJvdW5jZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKCdtaW4taGVpZ2h0JywgJHdpbmRvdy5pbm5lckhlaWdodCArICdweCcpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEJpbmQgcmVzaXplIGV2ZW50IHRvIHdpbmRvd1xuXHRcdFx0ICogQXBwbHkgbWluLWhlaWdodCB0byBsYXlvdXQgdG9cblx0XHRcdCAqIG1ha2UgbmF2IGZ1bGwtaGVpZ2h0XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9sYXlvdXRIZWlnaHQoKSB7XG5cdFx0XHRcdCR0aW1lb3V0LmNhbmNlbChfZGVib3VuY2VSZXNpemUpO1xuXHRcdFx0XHRfZGVib3VuY2VSZXNpemUgPSAkdGltZW91dChfcmVzaXplZCwgMjAwKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcnVuIGluaXRpYWwgbGF5b3V0IGhlaWdodCBjYWxjdWxhdGlvblxuXHRcdFx0X2xheW91dEhlaWdodCgpO1xuXG5cdFx0XHQvLyBiaW5kIGhlaWdodCBjYWxjdWxhdGlvbiB0byB3aW5kb3cgcmVzaXplXG5cdFx0XHRfd2luLmJpbmQoJ3Jlc2l6ZScsIF9sYXlvdXRIZWlnaHQpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0X2JvZHlcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdC5hZGRDbGFzcygnbmF2LWNsb3NlZCcpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0XHRfY2xvc2VOYXYoKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIF9jbG9zZU5hdik7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0X2JvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBVbmJpbmQgcmVzaXplIGxpc3RlbmVyIG9uIGRlc3RydWN0aW9uIG9mIHNjb3BlXG5cdFx0XHQgKi9cblx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHdpbi51bmJpbmQoJ3Jlc2l6ZScsIF9sYXlvdXRIZWlnaHQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFNldCB1cCBmdW5jdGlvbmFsaXR5IHRvIHJ1biBvbiBlbnRlci9leGl0IG9mIG1lZGlhIHF1ZXJ5XG5cdFx0XHRtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJNb2JpbGUsXG5cdFx0XHRcdGV4aXQ6IF9leGl0TW9iaWxlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJ0dsb2JhbE9iaicsICdQYWdlJywgJ3Jlc29sdmVMb2NhbERhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoR2xvYmFsT2JqLCBQYWdlLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aG9tZS5nbG9iYWwgPSBHbG9iYWxPYmo7XHJcblx0XHRob21lLm5hbWUgPSAnVmlzaXRvcic7XHJcblx0XHRob21lLnN0cmluZ09mSFRNTCA9ICc8c3Ryb25nIHN0eWxlPVwiY29sb3I6IGdyZWVuO1wiPlNvbWUgZ3JlZW4gdGV4dDwvc3Ryb25nPiBib3VuZCBhcyBIVE1MIHdpdGggYSA8YSBocmVmPVwiI1wiPmxpbms8L2E+LCB0cnVzdGVkIHdpdGggU0NFISc7XHJcblxyXG5cdFx0Ly8gc2V0IHBhZ2UgPHRpdGxlPlxyXG5cdFx0UGFnZS5zZXRUaXRsZSgnSG9tZScpO1xyXG5cclxuXHRcdC8vIGRhdGEgZnJvbSByb3V0ZSByZXNvbHZlXHJcblx0XHRob21lLmpzb24gPSByZXNvbHZlTG9jYWxEYXRhO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuY29udHJvbGxlcignU3ViQ3RybCcsIFN1YkN0cmwpO1xyXG5cclxuXHRTdWJDdHJsLiRpbmplY3QgPSBbJ0dsb2JhbE9iaicsICdQYWdlJywgJ3Jlc29sdmVMb2NhbERhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gU3ViQ3RybChHbG9iYWxPYmosIFBhZ2UsIHJlc29sdmVMb2NhbERhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBzdWIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdHN1Yi5nbG9iYWwgPSBHbG9iYWxPYmo7XHJcblxyXG5cdFx0Ly8gc2V0IHBhZ2UgPHRpdGxlPlxyXG5cdFx0UGFnZS5zZXRUaXRsZSgnU3VicGFnZScpO1xyXG5cclxuXHRcdC8vIGRhdGEgZnJvbSByb3V0ZSByZXNvbHZlXHJcblx0XHRzdWIuanNvbiA9IHJlc29sdmVMb2NhbERhdGE7XHJcblx0fVxyXG5cclxufSkoKTsiLCIvLyBEaXJlY3RpdmVzIChhbmQgYXNzb2NpYXRlZCBhdHRyaWJ1dGVzKSBhcmUgY2FtZWxDYXNlIGluIEpTIGFuZCBzbmFrZS1jYXNlIGluIEhUTUxcclxuLy8gQW5ndWxhcidzIGJ1aWx0LWluIDxhPiBkaXJlY3RpdmUgYXV0b21hdGljYWxseSBpbXBsZW1lbnRzIHByZXZlbnREZWZhdWx0IG9uIGxpbmtzIHRoYXQgZG9uJ3QgaGF2ZSBhbiBocmVmIGF0dHJpYnV0ZVxyXG4vLyBDb21wbGV4IEphdmFTY3JpcHQgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYWx3YXlzIGJlIGRvbmUgaW4gZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb25zLCBhbmQgJGFwcGx5IHNob3VsZCBuZXZlciBiZSB1c2VkIGluIGEgY29udHJvbGxlciEgU2ltcGxlIERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGJlIGluIHRoZSB2aWV3LlxyXG5cclxuLyotLS0gU2FtcGxlIERpcmVjdGl2ZSB3aXRoIGEgJHdhdGNoIC0tLSovXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ215QXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ3NhbXBsZURpcmVjdGl2ZScsIHNhbXBsZURpcmVjdGl2ZSk7XHJcblxyXG5cdHNhbXBsZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cdC8qKlxyXG5cdCAqIHNhbXBsZURpcmVjdGl2ZSBkaXJlY3RpdmVcclxuXHQgKiBTYW1wbGUgZGlyZWN0aXZlIHdpdGggaXNvbGF0ZSBzY29wZSxcclxuXHQgKiBjb250cm9sbGVyLCBsaW5rLCB0cmFuc2NsdXNpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IGRpcmVjdGl2ZVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZSgkdGltZW91dCkge1xyXG5cclxuXHRcdHNhbXBsZURpcmVjdGl2ZUxpbmsuJGluamVjdCA9IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICdzZCddO1xyXG5cdFx0LyoqXHJcblx0XHQgKiBzYW1wbGVEaXJlY3RpdmUgTElOSyBmdW5jdGlvblxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcclxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxyXG5cdFx0ICogQHBhcmFtICRhdHRyc1xyXG5cdFx0ICogQHBhcmFtIHNkIHtjb250cm9sbGVyfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzYW1wbGVEaXJlY3RpdmVMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgc2QpIHtcclxuXHRcdFx0Ly8gd2F0Y2ggZm9yIGFzeW5jIGRhdGEgdG8gYmVjb21lIGF2YWlsYWJsZSBhbmQgdXBkYXRlXHJcblx0XHRcdCRzY29wZS4kd2F0Y2goJ3NkLmpzb25EYXRhJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcclxuXHRcdFx0XHRpZiAobmV3VmFsKSB7XHJcblx0XHRcdFx0XHRzZC5qc29uRGF0YSA9IG5ld1ZhbDtcclxuXHJcblx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ2hpJyk7XHJcblx0XHRcdFx0XHR9LCAxMDAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdGpzb25EYXRhOiAnPSdcclxuXHRcdFx0fSxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvc3ViL3NhbXBsZS50cGwuaHRtbCcsXHJcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXHJcblx0XHRcdGNvbnRyb2xsZXI6IFNhbXBsZURpcmVjdGl2ZUN0cmwsXHJcblx0XHRcdGNvbnRyb2xsZXJBczogJ3NkJyxcclxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcclxuXHRcdFx0bGluazogc2FtcGxlRGlyZWN0aXZlTGlua1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdFNhbXBsZURpcmVjdGl2ZUN0cmwuJGluamVjdCA9IFtdO1xyXG5cdC8qKlxyXG5cdCAqIHNhbXBsZURpcmVjdGl2ZSBDT05UUk9MTEVSXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gU2FtcGxlRGlyZWN0aXZlQ3RybCgpIHtcclxuXHRcdHZhciBzZCA9IHRoaXM7XHJcblx0fVxyXG5cclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=