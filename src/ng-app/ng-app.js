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

		return {
			greeting: greeting
		};
	}
})();
// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('myApp')
		.service('JSONData', jsonData);

	/**
	 * GET promise response function
	 * Checks typeof data returned and succeeds if JS object, throws error if not
	 *
	 * @param response {*} data from $http
	 * @returns {*} object, array
	 * @private
	 */
	function _getRes(response) {
		if (typeof response.data === 'object') {
			return response.data;
		} else {
			throw new Error('retrieved data is not typeof object.');
		}
	}

	jsonData.$inject = ['$http'];

	function jsonData($http) {
		/**
		 * Get local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		this.getLocalData = function() {
			return $http
				.get('/ng-app/data/data.json')
				.then(_getRes);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		// media query constants
		.constant('MQ', {
			SMALL: '(max-width: 767px)',
			LARGE: '(min-width: 768px)'
		});

})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page'];

	function PageCtrl(Page) {
		var page = this;

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
				controllerAs: 'home'
			})
			.when('/subpage', {
				templateUrl: 'ng-app/sub/Sub.view.html',
				controller: 'SubCtrl',
				controllerAs: 'sub'
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
					clearTimeout(debounceResize);
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
		.filter('trustAsHTML', trustAsHTML);

	trustAsHTML.$inject = ['$sce'];

	function trustAsHTML($sce) {
		return function (text) {
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
				$timeout(function () {
					$scope.vs.viewformat = 'small';
				});
			}

			/**
			 * Function to run on exit media query
			 *
			 * @param {object} mq media query
			 */
			function _exitFn(mq) {
				$timeout(function () {
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
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'JSONData'];

	function headerCtrl($scope, $location, JSONData) {
		// controllerAs ViewModel
		var header = this;

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

	navControl.$inject = ['mediaCheck', 'MQ', '$timeout'];

	function navControl(mediaCheck, MQ, $timeout) {

		navControlLink.$inject = ['$scope', '$element', '$attrs'];

		function navControlLink($scope) {
			// data object
			$scope.nav = {};

			var _body = angular.element('body'),
				_navOpen;

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

	HomeCtrl.$inject = ['GlobalObj', 'JSONData', 'Page'];

	function HomeCtrl(GlobalObj, JSONData, Page) {
		// controllerAs ViewModel
		var home = this;

		Page.setTitle('Home');

		// put global variables in scope
		home.global = GlobalObj;

		// simple data binding example
		home.name = 'Visitor';

		// simple SCE ng-bind-html example
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';

		/**
		 * Successful promise data
		 *
		 * @param data {json}
		 * @private
		 */
		function _getJsonSuccess(data) {
			home.json = data;
		}

		// get the data from JSON
		JSONData.getLocalData().then(_getJsonSuccess);
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('SubCtrl', subCtrl);

	subCtrl.$inject = ['GlobalObj', 'JSONData', 'Page'];

	function subCtrl(GlobalObj, JSONData, Page) {
		// controllerAs ViewModel
		var sub = this;

		Page.setTitle('Subpage');

		// put global variables in the scope
		sub.global = GlobalObj;

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
// Directives (and associated attributes) are camelCase in JS and snake-case in HTML
// Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
// Complex JavaScript DOM manipulation should always be done in directives, and $apply should never be used in a controller! Simpler DOM manipulation should be in the view.

/*--- Sample Directive with a $watch ---*/
(function() {
	'use strict';

	angular
		.module('myApp')
		.directive('directiveName', directiveName);

	function directiveName() {

		directiveNameLink.$inject = ['$scope', '$element', '$attrs'];

		function directiveNameLink($scope, $element, $attrs) {
			// data object
			$scope.dir = {};

			// watch for async data to become available and update
			$scope.$watch('jsonData', function(newVal, oldVal) {
				if (newVal) {
					$scope.dir.jsonData = $scope.jsonData;
				}
			}, true);
		}

		return {
			restrict: 'EA',
			scope: {
				jsonData: '='
			},
			templateUrl: 'ng-app/sub/sample.tpl.html',
			transclude: true,
			link: directiveNameLink
		};
	}

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL0dsb2JhbE9iai5mYWN0b3J5LmpzIiwiY29yZS9KU09ORGF0YS5zZXJ2aWNlLmpzIiwiY29yZS9NUS5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL2FwcC5jb25maWcuanMiLCJjb3JlL21lZGlhQ2hlY2suc2VydmljZS5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS92aWV3U3dpdGNoLmRpci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwic3ViL1N1Yi5jdHJsLmpzIiwic3ViL3NhbXBsZS5kaXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZy1hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG5cdC5tb2R1bGUoJ215QXBwJywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICdtZWRpYUNoZWNrJ10pOyIsIi8vIFwiZ2xvYmFsXCIgb2JqZWN0IHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlcnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZhY3RvcnkoJ0dsb2JhbE9iaicsIEdsb2JhbE9iaik7XG5cblx0ZnVuY3Rpb24gR2xvYmFsT2JqKCkge1xuXHRcdHZhciBncmVldGluZyA9ICdIZWxsbyc7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Z3JlZXRpbmc6IGdyZWV0aW5nXG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBmZXRjaCBKU09OIGRhdGEgdG8gc2hhcmUgYmV0d2VlbiBjb250cm9sbGVyc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuc2VydmljZSgnSlNPTkRhdGEnLCBqc29uRGF0YSk7XG5cblx0LyoqXG5cdCAqIEdFVCBwcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdCAqXG5cdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBfZ2V0UmVzKHJlc3BvbnNlKSB7XG5cdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0fVxuXHR9XG5cblx0anNvbkRhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiBqc29uRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIEdldCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdHRoaXMuZ2V0TG9jYWxEYXRhID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL25nLWFwcC9kYXRhL2RhdGEuanNvbicpXG5cdFx0XHRcdC50aGVuKF9nZXRSZXMpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuXHRcdC5jb25zdGFudCgnTVEnLCB7XG5cdFx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0XHR9KTtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSkge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCdQYWdlJywgUGFnZSk7XG5cblx0ZnVuY3Rpb24gUGFnZSgpIHtcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0hvbWUnO1xuXG5cdFx0ZnVuY3Rpb24gdGl0bGUoKSB7XG5cdFx0XHRyZXR1cm4gcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIGNvbmZpZ1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9zdWJwYWdlJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9zdWIvU3ViLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdTdWJDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnc3ViJ1xuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgYW5ndWxhck1lZGlhQ2hlY2sgPSBhbmd1bGFyLm1vZHVsZSgnbWVkaWFDaGVjaycsIFtdKTtcblxuXHRhbmd1bGFyTWVkaWFDaGVjay5zZXJ2aWNlKCdtZWRpYUNoZWNrJywgWyckd2luZG93JywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCR3aW5kb3csICR0aW1lb3V0KSB7XG5cdFx0dGhpcy5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdHZhciAkc2NvcGUgPSBvcHRpb25zWydzY29wZSddLFxuXHRcdFx0XHRxdWVyeSA9IG9wdGlvbnNbJ21xJ10sXG5cdFx0XHRcdGRlYm91bmNlID0gb3B0aW9uc1snZGVib3VuY2UnXSxcblx0XHRcdFx0JHdpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KSxcblx0XHRcdFx0YnJlYWtwb2ludHMsXG5cdFx0XHRcdGNyZWF0ZUxpc3RlbmVyID0gdm9pZCAwLFxuXHRcdFx0XHRoYXNNYXRjaE1lZGlhID0gJHdpbmRvdy5tYXRjaE1lZGlhICE9PSB1bmRlZmluZWQgJiYgISEkd2luZG93Lm1hdGNoTWVkaWEoJyEnKS5hZGRMaXN0ZW5lcixcblx0XHRcdFx0bXFMaXN0TGlzdGVuZXIsXG5cdFx0XHRcdG1tTGlzdGVuZXIsXG5cdFx0XHRcdGRlYm91bmNlUmVzaXplLFxuXHRcdFx0XHRtcSA9IHZvaWQgMCxcblx0XHRcdFx0bXFDaGFuZ2UgPSB2b2lkIDAsXG5cdFx0XHRcdGRlYm91bmNlU3BlZWQgPSAhIWRlYm91bmNlID8gZGVib3VuY2UgOiAyNTA7XG5cblx0XHRcdGlmIChoYXNNYXRjaE1lZGlhKSB7XG5cdFx0XHRcdG1xQ2hhbmdlID0gZnVuY3Rpb24gKG1xKSB7XG5cdFx0XHRcdFx0aWYgKG1xLm1hdGNoZXMgJiYgdHlwZW9mIG9wdGlvbnMuZW50ZXIgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuZW50ZXIobXEpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZXhpdCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmV4aXQobXEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmNoYW5nZShtcSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNyZWF0ZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG1xID0gJHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KTtcblx0XHRcdFx0XHRtcUxpc3RMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShtcSlcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0bXEuYWRkTGlzdGVuZXIobXFMaXN0TGlzdGVuZXIpO1xuXG5cdFx0XHRcdFx0Ly8gYmluZCB0byB0aGUgb3JpZW50YXRpb25jaGFuZ2UgZXZlbnQgYW5kIGZpcmUgbXFDaGFuZ2Vcblx0XHRcdFx0XHQkd2luLmJpbmQoJ29yaWVudGF0aW9uY2hhbmdlJywgbXFMaXN0TGlzdGVuZXIpO1xuXG5cdFx0XHRcdFx0Ly8gY2xlYW51cCBsaXN0ZW5lcnMgd2hlbiAkc2NvcGUgaXMgJGRlc3Ryb3llZFxuXHRcdFx0XHRcdCRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0bXEucmVtb3ZlTGlzdGVuZXIobXFMaXN0TGlzdGVuZXIpO1xuXHRcdFx0XHRcdFx0JHdpbi51bmJpbmQoJ29yaWVudGF0aW9uY2hhbmdlJywgbXFMaXN0TGlzdGVuZXIpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIG1xQ2hhbmdlKG1xKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXR1cm4gY3JlYXRlTGlzdGVuZXIoKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnJlYWtwb2ludHMgPSB7fTtcblxuXHRcdFx0XHRtcUNoYW5nZSA9IGZ1bmN0aW9uIChtcSkge1xuXHRcdFx0XHRcdGlmIChtcS5tYXRjaGVzKSB7XG5cdFx0XHRcdFx0XHRpZiAoISFicmVha3BvaW50c1txdWVyeV0gPT09IGZhbHNlICYmICh0eXBlb2Ygb3B0aW9ucy5lbnRlciA9PT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5lbnRlcihtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmIChicmVha3BvaW50c1txdWVyeV0gPT09IHRydWUgfHwgYnJlYWtwb2ludHNbcXVlcnldID09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmV4aXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zLmV4aXQobXEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKChtcS5tYXRjaGVzICYmICghYnJlYWtwb2ludHNbcXVlcnldKSB8fCAoIW1xLm1hdGNoZXMgJiYgKGJyZWFrcG9pbnRzW3F1ZXJ5XSA9PT0gdHJ1ZSB8fCBicmVha3BvaW50c1txdWVyeV0gPT0gbnVsbCkpKSkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmNoYW5nZShtcSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGJyZWFrcG9pbnRzW3F1ZXJ5XSA9IG1xLm1hdGNoZXM7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGNvbnZlcnRFbVRvUHggPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0XHR2YXIgZW1FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cblx0XHRcdFx0XHRlbUVsZW1lbnQuc3R5bGUud2lkdGggPSAnMWVtJztcblx0XHRcdFx0XHRlbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZW1FbGVtZW50KTtcblx0XHRcdFx0XHRweCA9IHZhbHVlICogZW1FbGVtZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZW1FbGVtZW50KTtcblxuXHRcdFx0XHRcdHJldHVybiBweDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZ2V0UFhWYWx1ZSA9IGZ1bmN0aW9uICh3aWR0aCwgdW5pdCkge1xuXHRcdFx0XHRcdHZhciB2YWx1ZTtcblx0XHRcdFx0XHR2YWx1ZSA9IHZvaWQgMDtcblx0XHRcdFx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdFx0XHRcdGNhc2UgJ2VtJzpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0RW1Ub1B4KHdpZHRoKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHdpZHRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0YnJlYWtwb2ludHNbcXVlcnldID0gbnVsbDtcblxuXHRcdFx0XHRtbUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBwYXJ0cyA9IHF1ZXJ5Lm1hdGNoKC9cXCgoLiopLS4qOlxccyooW1xcZFxcLl0qKSguKilcXCkvKSxcblx0XHRcdFx0XHRcdGNvbnN0cmFpbnQgPSBwYXJ0c1sxXSxcblx0XHRcdFx0XHRcdHZhbHVlID0gZ2V0UFhWYWx1ZShwYXJzZUludChwYXJ0c1syXSwgMTApLCBwYXJ0c1szXSksXG5cdFx0XHRcdFx0XHRmYWtlTWF0Y2hNZWRpYSA9IHt9LFxuXHRcdFx0XHRcdFx0d2luZG93V2lkdGggPSAkd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG5cdFx0XHRcdFx0ZmFrZU1hdGNoTWVkaWEubWF0Y2hlcyA9IGNvbnN0cmFpbnQgPT09ICdtYXgnICYmIHZhbHVlID4gd2luZG93V2lkdGggfHwgY29uc3RyYWludCA9PT0gJ21pbicgJiYgdmFsdWUgPCB3aW5kb3dXaWR0aDtcblxuXHRcdFx0XHRcdHJldHVybiBtcUNoYW5nZShmYWtlTWF0Y2hNZWRpYSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGZha2VNYXRjaE1lZGlhUmVzaXplID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNsZWFyVGltZW91dChkZWJvdW5jZVJlc2l6ZSk7XG5cdFx0XHRcdFx0ZGVib3VuY2VSZXNpemUgPSAkdGltZW91dChtbUxpc3RlbmVyLCBkZWJvdW5jZVNwZWVkKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkd2luLmJpbmQoJ3Jlc2l6ZScsIGZha2VNYXRjaE1lZGlhUmVzaXplKTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkd2luLnVuYmluZCgncmVzaXplJywgZmFrZU1hdGNoTWVkaWFSZXNpemUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gbW1MaXN0ZW5lcigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1dKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiAodGV4dCkge1xuXHRcdFx0cmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dCk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBGb3IgZXZlbnRzIGJhc2VkIG9uIHZpZXdwb3J0IHNpemUgLSB1cGRhdGVzIGFzIHZpZXdwb3J0IGlzIHJlc2l6ZWRcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmRpcmVjdGl2ZSgndmlld1N3aXRjaCcsIHZpZXdTd2l0Y2gpO1xuXG5cdHZpZXdTd2l0Y2guJGluamVjdCA9IFsnbWVkaWFDaGVjaycsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIHZpZXdTd2l0Y2gobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0KSB7XG5cblx0XHR2aWV3U3dpdGNoTGluay4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblx0XHRcblx0XHRmdW5jdGlvbiB2aWV3U3dpdGNoTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUudnMgPSB7fTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBydW4gb24gZW50ZXIgbWVkaWEgcXVlcnlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gbXEgbWVkaWEgcXVlcnlcbiBcdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlckZuKG1xKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQkc2NvcGUudnMudmlld2Zvcm1hdCA9ICdzbWFsbCc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIHJ1biBvbiBleGl0IG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IG1xIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0Rm4obXEpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS52cy52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGluaXRpYWxpemUgbWVkaWFDaGVja1xuXHRcdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyRm4sXG5cdFx0XHRcdGV4aXQ6IF9leGl0Rm5cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IHZpZXdTd2l0Y2hMaW5rXG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnSlNPTkRhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgSlNPTkRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gaW5kZXhJc0FjdGl2ZTtcclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IG5hdklzQWN0aXZlO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7anNvbn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9nZXRKc29uU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhlYWRlci5qc29uID0gZGF0YTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBnZXQgdGhlIGRhdGEgZnJvbSBKU09OXHJcblx0XHRKU09ORGF0YS5nZXRMb2NhbERhdGEoKS50aGVuKF9nZXRKc29uU3VjY2Vzcyk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBcHBseSBjbGFzcyB0byBpbmRleCBuYXYgaWYgYWN0aXZlXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuIFx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluZGV4SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSAnLydcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09IHBhdGg7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBcHBseSBjbGFzcyB0byBjdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqL1xyXG5cdFx0IGZ1bmN0aW9uIG5hdklzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnbWVkaWFDaGVjaycsICdNUScsICckdGltZW91dCddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2wobWVkaWFDaGVjaywgTVEsICR0aW1lb3V0KSB7XG5cblx0XHRuYXZDb250cm9sTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJ107XG5cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdHZhciBfYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpLFxuXHRcdFx0XHRfbmF2T3BlbjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF9ib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1vcGVuJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xuXHRcdFx0XHRfYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LWNsb3NlZCcpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0XHRfY2xvc2VOYXYoKTtcblxuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIF9jbG9zZU5hdik7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0X2JvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHRcdG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXG5cdFx0fTtcblx0fVxuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ215QXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnR2xvYmFsT2JqJywgJ0pTT05EYXRhJywgJ1BhZ2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoR2xvYmFsT2JqLCBKU09ORGF0YSwgUGFnZSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0hvbWUnKTtcclxuXHJcblx0XHQvLyBwdXQgZ2xvYmFsIHZhcmlhYmxlcyBpbiBzY29wZVxyXG5cdFx0aG9tZS5nbG9iYWwgPSBHbG9iYWxPYmo7XHJcblxyXG5cdFx0Ly8gc2ltcGxlIGRhdGEgYmluZGluZyBleGFtcGxlXHJcblx0XHRob21lLm5hbWUgPSAnVmlzaXRvcic7XHJcblxyXG5cdFx0Ly8gc2ltcGxlIFNDRSBuZy1iaW5kLWh0bWwgZXhhbXBsZVxyXG5cdFx0aG9tZS5zdHJpbmdPZkhUTUwgPSAnPHN0cm9uZyBzdHlsZT1cImNvbG9yOiBncmVlbjtcIj5Tb21lIGdyZWVuIHRleHQ8L3N0cm9uZz4gYm91bmQgYXMgSFRNTCB3aXRoIGEgPGEgaHJlZj1cIiNcIj5saW5rPC9hPiwgdHJ1c3RlZCB3aXRoIFNDRSEnO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSB7anNvbn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9nZXRKc29uU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUuanNvbiA9IGRhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ2V0IHRoZSBkYXRhIGZyb20gSlNPTlxyXG5cdFx0SlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCkudGhlbihfZ2V0SnNvblN1Y2Nlc3MpO1xyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuY29udHJvbGxlcignU3ViQ3RybCcsIHN1YkN0cmwpO1xyXG5cclxuXHRzdWJDdHJsLiRpbmplY3QgPSBbJ0dsb2JhbE9iaicsICdKU09ORGF0YScsICdQYWdlJ107XHJcblxyXG5cdGZ1bmN0aW9uIHN1YkN0cmwoR2xvYmFsT2JqLCBKU09ORGF0YSwgUGFnZSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIHN1YiA9IHRoaXM7XHJcblxyXG5cdFx0UGFnZS5zZXRUaXRsZSgnU3VicGFnZScpO1xyXG5cclxuXHRcdC8vIHB1dCBnbG9iYWwgdmFyaWFibGVzIGluIHRoZSBzY29wZVxyXG5cdFx0c3ViLmdsb2JhbCA9IEdsb2JhbE9iajtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRzdWIuanNvbiA9IGRhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZ2V0IHRoZSBkYXRhIGZyb20gSlNPTlxyXG5cdFx0SlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCkudGhlbihfZ2V0SnNvblN1Y2Nlc3MpO1xyXG5cdH1cclxuXHJcbn0pKCk7IiwiLy8gRGlyZWN0aXZlcyAoYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlcykgYXJlIGNhbWVsQ2FzZSBpbiBKUyBhbmQgc25ha2UtY2FzZSBpbiBIVE1MXHJcbi8vIEFuZ3VsYXIncyBidWlsdC1pbiA8YT4gZGlyZWN0aXZlIGF1dG9tYXRpY2FsbHkgaW1wbGVtZW50cyBwcmV2ZW50RGVmYXVsdCBvbiBsaW5rcyB0aGF0IGRvbid0IGhhdmUgYW4gaHJlZiBhdHRyaWJ1dGVcclxuLy8gQ29tcGxleCBKYXZhU2NyaXB0IERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGFsd2F5cyBiZSBkb25lIGluIGRpcmVjdGl2ZXMsIGFuZCAkYXBwbHkgc2hvdWxkIG5ldmVyIGJlIHVzZWQgaW4gYSBjb250cm9sbGVyISBTaW1wbGVyIERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGJlIGluIHRoZSB2aWV3LlxyXG5cclxuLyotLS0gU2FtcGxlIERpcmVjdGl2ZSB3aXRoIGEgJHdhdGNoIC0tLSovXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ215QXBwJylcclxuXHRcdC5kaXJlY3RpdmUoJ2RpcmVjdGl2ZU5hbWUnLCBkaXJlY3RpdmVOYW1lKTtcclxuXHJcblx0ZnVuY3Rpb24gZGlyZWN0aXZlTmFtZSgpIHtcclxuXHJcblx0XHRkaXJlY3RpdmVOYW1lTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJ107XHJcblxyXG5cdFx0ZnVuY3Rpb24gZGlyZWN0aXZlTmFtZUxpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XHJcblx0XHRcdC8vIGRhdGEgb2JqZWN0XHJcblx0XHRcdCRzY29wZS5kaXIgPSB7fTtcclxuXHJcblx0XHRcdC8vIHdhdGNoIGZvciBhc3luYyBkYXRhIHRvIGJlY29tZSBhdmFpbGFibGUgYW5kIHVwZGF0ZVxyXG5cdFx0XHQkc2NvcGUuJHdhdGNoKCdqc29uRGF0YScsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xyXG5cdFx0XHRcdFx0JHNjb3BlLmRpci5qc29uRGF0YSA9ICRzY29wZS5qc29uRGF0YTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIHRydWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRzY29wZToge1xyXG5cdFx0XHRcdGpzb25EYXRhOiAnPSdcclxuXHRcdFx0fSxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvc3ViL3NhbXBsZS50cGwuaHRtbCcsXHJcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXHJcblx0XHRcdGxpbms6IGRpcmVjdGl2ZU5hbWVMaW5rXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9