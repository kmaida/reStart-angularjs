// application module setter
(function() {
	'use strict';

	angular
		.module('reStart', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck', 'resize']);
})();
// "global" object to share between controllers
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('GlobalObj', GlobalObj);

	function GlobalObj() {
		var greeting = 'Hello';

		// callable members
		return {
			greeting: greeting,
			alertGreeting: alertGreeting
		};

		/**
		 * Alert greeting
		 *
		 * @param name {string}
		 */
		function alertGreeting(name) {
			alert(greeting + ', ' + name + '!');
		}
	}
})();
// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('JSONData', JSONData);

	JSONData.$inject = ['$http'];

	function JSONData($http) {
		// callable members
		return {
			getLocalData: getLocalData
		};

		/**
		 * Promise response function - success
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 * Useful for APIs (ie, with nginx) where server error HTML page may be returned in error
		 *
		 * @param response {*} data from $http
		 * @returns {object|Array}
		 * @private
		 */
		function _successRes(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				throw new Error('Retrieved data is not typeof object.');
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
			throw new Error('Error retrieving data', error);
		}

		/**
		 * GET local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getLocalData() {
			return $http
				.get('/data/data.json')
				.then(_successRes, _errorRes);
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
		.module('reStart')
		.constant('MQ', MQ);
})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page', '$scope', 'MQ', 'mediaCheck'];

	function PageCtrl(Page, $scope, MQ, mediaCheck) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;
		// Set up functionality to run on enter/exit of media query
		var mc = mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			},
			debounce: 200
		});

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// associate page <title>
			page.pageTitle = Page;

			$scope.$on('$routeChangeStart', _routeChangeStart);
			$scope.$on('$routeChangeSuccess', _routeChangeSuccess);
			$scope.$on('$routeChangeError', _routeChangeError);
		}

		/**
		 * Enter mobile media query
		 * $broadcast 'enter-mobile' event
		 *
		 * @private
		 */
		function _enterMobile() {
			$scope.$broadcast('enter-mobile');
		}

		/**
		 * Exit mobile media query
		 * $broadcast 'exit-mobile' event
		 *
		 * @private
		 */
		function _exitMobile() {
			$scope.$broadcast('exit-mobile');
		}

		/**
		 * Turn on loading state
		 *
		 * @private
		 */
		function _loadingOn() {
			$scope.$broadcast('loading-on');
		}

		/**
		 * Turn off loading state
		 *
		 * @private
		 */
		function _loadingOff() {
			$scope.$broadcast('loading-off');
		}

		/**
		 * Route change start handler
		 * If next route has resolve, turn on loading
		 *
		 * @param $event {object}
		 * @param next {object}
		 * @param current {object}
		 * @private
		 */
		function _routeChangeStart($event, next, current) {
			if (next.$$route.resolve) {
				_loadingOn();
			}
		}

		/**
		 * Route change success handler
		 * Match current media query and run appropriate function
		 * If current route has been resolved, turn off loading
		 *
		 * @param $event {object}
		 * @param current {object}
		 * @param previous {object}
		 * @private
		 */
		function _routeChangeSuccess($event, current, previous) {
			mc.matchCurrent(MQ.SMALL);

			if (current.$$route.resolve) {
				_loadingOff();
			}
		}

		/**
		 * Route change error handler
		 * Handle route resolve failures
		 *
		 * @param $event {object}
		 * @param current {object}
		 * @param previous {object}
		 * @param rejection {object}
		 * @private
		 */
		function _routeChangeError($event, current, previous, rejection) {
			if (_handlingRouteChangeError) {
				return;
			}

			_handlingRouteChangeError = true;
			_loadingOff();

			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			console.log(msg);

			/**
			 * On routing error, show an error.
			 */
			alert('An error occurred. Please try again.');
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('Page', Page);

	function Page() {
		var siteTitle = 'reStart Angular';
		var pageTitle = 'Home';

		// callable members
		return {
			title: title,
			setTitle: setTitle
		};

		/**
		 * Title function
		 * Sets site title and page title
		 *
		 * @returns {string} site title + page title
		 */
		function title() {
			return siteTitle + ' | ' + pageTitle;
		}

		/**
		 * Set page title
		 *
		 * @param newTitle {string}
		 */
		function setTitle(newTitle) {
			pageTitle = newTitle;
		}
	}
})();
// application config
(function() {
	'use strict';

	angular
		.module('reStart')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'reStart-app/pages/home/Home.view.html',
				controller: 'HomeCtrl',
				controllerAs: 'home'
			})
			.when('/subpage', {
				templateUrl: 'reStart-app/pages/sub/Sub.view.html',
				controller: 'SubCtrl',
				controllerAs: 'sub',
				resolve: {
					resolveLocalData: resolveLocalData
				}
			})
			.when('/404', {
				templateUrl: 'reStart-app/pages/404/404.view.html',
				controller: 'Error404Ctrl',
				controllerAs: 'e404'
			})
			.otherwise({
				redirectTo: '/404'
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
	 * @returns {promise} data
	 */
	function resolveLocalData(JSONData) {
		return JSONData.getLocalData();
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.directive('loading', loading);

	loading.$inject = ['$window', 'resize'];

	function loading($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'reStart-app/core/loading.tpl.html',
			transclude: true,
			controller: loadingCtrl,
			controllerAs: 'loading',
			bindToController: true,
			link: loadingLink
		};

		/**
		 * loading LINK
		 * Disables page scrolling when loading overlay is open
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param loading {controller}
		 */
		function loadingLink($scope, $element, $attrs, loading) {
			// private variables
			var _$body = angular.element('body');
			var _winHeight = $window.innerHeight + 'px';

			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// initialize debounced resize
				var _rs = resize.init({
					scope: $scope,
					resizedFn: _resized,
					debounce: 200
				});

				// $watch active state
				$scope.$watch('loading.active', _$watchActive);
			}

			/**
			 * Window resized
			 * If loading, reapply body height
			 * to prevent scrollbar
			 *
			 * @private
			 */
			function _resized() {
				_winHeight = $window.innerHeight + 'px';

				if (loading.active) {
					_$body.css({
						height: _winHeight,
						overflowY: 'hidden'
					});
				}
			}

			/**
			 * $watch loading.active
			 *
			 * @param newVal {boolean}
			 * @param oldVal {undefined|boolean}
			 * @private
			 */
			function _$watchActive(newVal, oldVal) {
				if (newVal) {
					_open();
				} else {
					_close();
				}
			}

			/**
			 * Open loading
			 * Disable scroll
			 *
			 * @private
			 */
			function _open() {
				_$body.css({
					height: _winHeight,
					overflowY: 'hidden'
				});
			}

			/**
			 * Close loading
			 * Enable scroll
			 *
			 * @private
			 */
			function _close() {
				_$body.css({
					height: 'auto',
					overflowY: 'auto'
				});
			}
		}
	}

	loadingCtrl.$inject = ['$scope'];
	/**
	 * loading CONTROLLER
	 * Update the loading status based
	 * on routeChange state
	 */
	function loadingCtrl($scope) {
		var loading = this;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			$scope.$on('loading-on', _loadingActive);
			$scope.$on('loading-off', _loadingInactive);
		}

		/**
		 * Set loading to active
		 *
		 * @private
		 */
		function _loadingActive() {
			loading.active = true;
		}

		/**
		 * Set loading to inactive
		 *
		 * @private
		 */
		function _loadingInactive() {
			loading.active = false;
		}
	}

})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.filter('trustAsHTML', trustAsHTML);

	trustAsHTML.$inject = ['$sce'];

	function trustAsHTML($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('HeaderCtrl', HeaderCtrl);

	HeaderCtrl.$inject = ['$location', 'JSONData'];

	function HeaderCtrl($location, JSONData) {
		// controllerAs ViewModel
		var header = this;

		// bindable members
		header.indexIsActive = indexIsActive;
		header.navIsActive = navIsActive;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// activate controller
			_activate();
		}

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

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			/**
			 * Successful promise data
			 *
			 * @param data {json}
			 * @private
			 */
			function _getJsonSuccess(data) {
				header.json = data;
				return header.json;
			}

			// get the data from JSON
			return JSONData.getLocalData().then(_getJsonSuccess);
		}
	}

})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.directive('navControl', navControl);

	navControl.$inject = ['$window', 'resize'];

	function navControl($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			link: navControlLink
		};

		/**
		 * navControl LINK function
		 *
		 * @param $scope
		 */
		function navControlLink($scope) {
			// data model
			$scope.nav = {};

			// private variables
			var _$body = angular.element('body');
			var _layoutCanvas = _$body.find('.layout-canvas');
			var _navOpen;

			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// initialize debounced resize
				var _rs = resize.init({
					scope: $scope,
					resizedFn: _resized,
					debounce: 100
				});

				$scope.$on('$locationChangeStart', _$locationChangeStart);
				$scope.$on('enter-mobile', _enterMobile);
				$scope.$on('exit-mobile', _exitMobile);
			}

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_layoutCanvas.css({
					minHeight: $window.innerHeight + 'px'
				});
			}

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_$body
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
				_$body
					.removeClass('nav-open')
					.addClass('nav-closed');

				_navOpen = false;
			}

			/**
			 * Toggle nav open/closed
			 */
			function toggleNav() {
				if (!_navOpen) {
					_openNav();
				} else {
					_closeNav();
				}
			}

			/**
			 * When changing location, close the nav if it's open
			 */
			function _$locationChangeStart() {
				if (_navOpen) {
					_closeNav();
				}
			}

			/**
			 * Function to execute when entering mobile media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _enterMobile(mq) {
				_closeNav();

				// bind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = toggleNav;
			}

			/**
			 * Function to execute when exiting mobile media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _exitMobile(mq) {
				// unbind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = null;

				_$body.removeClass('nav-closed nav-open');
			}
		}
	}

})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('Error404Ctrl', Error404Ctrl);

	Error404Ctrl.$inject = ['Page'];

	function Error404Ctrl(Page) {
		var e404 = this;

		// bindable members
		e404.title = '404 - Page Not Found';

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// set page <title>
			Page.setTitle(e404.title);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'GlobalObj', 'Page', 'JSONData'];

	function HomeCtrl($scope, GlobalObj, Page, JSONData) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.title = 'Home';
		home.global = GlobalObj;
		home.name = 'Visitor';
		home.alertGreeting = GlobalObj.alertGreeting;
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
			Page.setTitle(home.title);

			// activate controller
			_activate();

			// mediaquery events
			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
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

			// start loading
			$scope.$emit('loading-on');

			// get the data from JSON
			return JSONData.getLocalData().then(_getJsonSuccess);
		}

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
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['GlobalObj', 'Page', 'resolveLocalData'];

	function SubCtrl(GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var sub = this;

		// bindable members
		sub.title = 'Subpage';
		sub.global = GlobalObj;
		sub.json = resolveLocalData;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// set page <title>
			Page.setTitle(sub.title);
		}
	}
})();
/**
 * Directives (and associated attributes) are always declared as camelCase in JS and snake-case in HTML
 * Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
 * Complex JavaScript DOM manipulation should always be done in directive link functions, and $apply should never be used in a controller! Simple DOM manipulation should be in the view.
 */

/*--- Sample Directive with a $watch ---*/
(function() {
	'use strict';

	angular
		.module('reStart')
		.directive('sampleDirective', sampleDirective);

	sampleDirective.$inject = ['$timeout'];

	function sampleDirective($timeout) {
		// return directive
		return {
			restrict: 'EA',
			replace: true,
			scope: {},
			templateUrl: 'reStart-app/pages/sub/sample.tpl.html',
			transclude: true,
			controller: SampleDirectiveCtrl,
			controllerAs: 'sd',
			bindToController: {
				jsonData: '='
			},
			link: sampleDirectiveLink
		};

		/**
		 * sampleDirective LINK function
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param sd {controller}
		 */
		function sampleDirectiveLink($scope, $element, $attrs, sd) {
			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// watch for async data to become available and update
				$scope.$watch('sd.jsonData', _$watchJsonData);
			}

			/**
			 * $watch for sd.jsonData to become available
			 *
			 * @param newVal {*}
			 * @param oldVal {*}
			 * @private
			 */
			function _$watchJsonData(newVal, oldVal) {
				if (newVal) {
					sd.jsonData = newVal;

					$timeout(function() {
						console.log('demonstrate $timeout injection in a directive link function');
					}, 1000);
				}
			}
		}
	}

	SampleDirectiveCtrl.$inject = [];
	/**
	 * sampleDirective CONTROLLER
	 */
	function SampleDirectiveCtrl() {
		var sd = this;

		// controller logic goes here
	}

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL0dsb2JhbE9iai5mYWN0b3J5LmpzIiwiY29yZS9KU09ORGF0YS5mYWN0b3J5LmpzIiwiY29yZS9NUS5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL2FwcC5jb25maWcuanMiLCJjb3JlL2xvYWRpbmcuZGlyLmpzIiwiY29yZS90cnVzdEFzSFRNTC5maWx0ZXIuanMiLCJtb2R1bGVzL2hlYWRlci9IZWFkZXIuY3RybC5qcyIsIm1vZHVsZXMvaGVhZGVyL25hdkNvbnRyb2wuZGlyLmpzIiwicGFnZXMvNDA0L0Vycm9yNDA0LmN0cmwuanMiLCJwYWdlcy9ob21lL0hvbWUuY3RybC5qcyIsInBhZ2VzL3N1Yi9TdWIuY3RybC5qcyIsInBhZ2VzL3N1Yi9zYW1wbGUuZGlyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InJlU3RhcnQtYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gYXBwbGljYXRpb24gbW9kdWxlIHNldHRlclxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnLCBbJ25nUm91dGUnLCAnbmdSZXNvdXJjZScsICduZ1Nhbml0aXplJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJ10pO1xufSkoKTsiLCIvLyBcImdsb2JhbFwiIG9iamVjdCB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmZhY3RvcnkoJ0dsb2JhbE9iaicsIEdsb2JhbE9iaik7XG5cblx0ZnVuY3Rpb24gR2xvYmFsT2JqKCkge1xuXHRcdHZhciBncmVldGluZyA9ICdIZWxsbyc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdyZWV0aW5nOiBncmVldGluZyxcblx0XHRcdGFsZXJ0R3JlZXRpbmc6IGFsZXJ0R3JlZXRpbmdcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQWxlcnQgZ3JlZXRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuYW1lIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYWxlcnRHcmVldGluZyhuYW1lKSB7XG5cdFx0XHRhbGVydChncmVldGluZyArICcsICcgKyBuYW1lICsgJyEnKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gZmV0Y2ggSlNPTiBkYXRhIHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlcnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZmFjdG9yeSgnSlNPTkRhdGEnLCBKU09ORGF0YSk7XG5cblx0SlNPTkRhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiBKU09ORGF0YSgkaHR0cCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TG9jYWxEYXRhOiBnZXRMb2NhbERhdGFcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIHN1Y2Nlc3Ncblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHtvYmplY3R8QXJyYXl9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc3VjY2Vzc1JlcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignUmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXG5cdFx0ICogVGhyb3dzIGFuIGVycm9yIHdpdGggZXJyb3IgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXJyb3JSZXMoZXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdFVCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExvY2FsRGF0YSgpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvZGF0YS9kYXRhLmpzb24nKVxuXHRcdFx0XHQudGhlbihfc3VjY2Vzc1JlcywgX2Vycm9yUmVzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb25zdGFudCgnTVEnLCBNUSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XG5cblx0UGFnZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckc2NvcGUnLCAnTVEnLCAnbWVkaWFDaGVjayddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKFBhZ2UsICRzY29wZSwgTVEsIG1lZGlhQ2hlY2spIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHR2YXIgbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBhc3NvY2lhdGUgcGFnZSA8dGl0bGU+XG5cdFx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX3JvdXRlQ2hhbmdlU3RhcnQpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBfcm91dGVDaGFuZ2VFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRW50ZXIgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZW50ZXItbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZW50ZXItbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhpdCBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZXhpdC1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9uIGxvYWRpbmcgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPbigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9uJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVHVybiBvZmYgbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09mZigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdGFydCBoYW5kbGVyXG5cdFx0ICogSWYgbmV4dCByb3V0ZSBoYXMgcmVzb2x2ZSwgdHVybiBvbiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIG5leHQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3RhcnQoJGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dC4kJHJvdXRlLnJlc29sdmUpIHtcblx0XHRcdFx0X2xvYWRpbmdPbigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdWNjZXNzIGhhbmRsZXJcblx0XHQgKiBNYXRjaCBjdXJyZW50IG1lZGlhIHF1ZXJ5IGFuZCBydW4gYXBwcm9wcmlhdGUgZnVuY3Rpb25cblx0XHQgKiBJZiBjdXJyZW50IHJvdXRlIGhhcyBiZWVuIHJlc29sdmVkLCB0dXJuIG9mZiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cykge1xuXHRcdFx0bWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblxuXHRcdFx0aWYgKGN1cnJlbnQuJCRyb3V0ZS5yZXNvbHZlKSB7XG5cdFx0XHRcdF9sb2FkaW5nT2ZmKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIGVycm9yIGhhbmRsZXJcblx0XHQgKiBIYW5kbGUgcm91dGUgcmVzb2x2ZSBmYWlsdXJlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHJlamVjdGlvbiB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlRXJyb3IoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cywgcmVqZWN0aW9uKSB7XG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXHRcdFx0X2xvYWRpbmdPZmYoKTtcblxuXHRcdFx0dmFyIGRlc3RpbmF0aW9uID0gKGN1cnJlbnQgJiYgKGN1cnJlbnQudGl0bGUgfHwgY3VycmVudC5uYW1lIHx8IGN1cnJlbnQubG9hZGVkVGVtcGxhdGVVcmwpKSB8fCAndW5rbm93biB0YXJnZXQnO1xuXHRcdFx0dmFyIG1zZyA9ICdFcnJvciByb3V0aW5nIHRvICcgKyBkZXN0aW5hdGlvbiArICcuICcgKyAocmVqZWN0aW9uLm1zZyB8fCAnJyk7XG5cblx0XHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT24gcm91dGluZyBlcnJvciwgc2hvdyBhbiBlcnJvci5cblx0XHRcdCAqL1xuXHRcdFx0YWxlcnQoJ0FuIGVycm9yIG9jY3VycmVkLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdHZhciBzaXRlVGl0bGUgPSAncmVTdGFydCBBbmd1bGFyJztcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0hvbWUnO1xuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVGl0bGUgZnVuY3Rpb25cblx0XHQgKiBTZXRzIHNpdGUgdGl0bGUgYW5kIHBhZ2UgdGl0bGVcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9IHNpdGUgdGl0bGUgKyBwYWdlIHRpdGxlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdGl0bGUoKSB7XG5cdFx0XHRyZXR1cm4gc2l0ZVRpdGxlICsgJyB8ICcgKyBwYWdlVGl0bGU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IHBhZ2UgdGl0bGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdUaXRsZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gYXBwbGljYXRpb24gY29uZmlnXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9zdWJwYWdlJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3BhZ2VzL3N1Yi9TdWIudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1N1YkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdzdWInLFxuXHRcdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdFx0cmVzb2x2ZUxvY2FsRGF0YTogcmVzb2x2ZUxvY2FsRGF0YVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy80MDQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvNDA0LzQwNC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRXJyb3I0MDRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZTQwNCdcblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy80MDQnXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cblxuXHRyZXNvbHZlTG9jYWxEYXRhLiRpbmplY3QgPSBbJ0pTT05EYXRhJ107XG5cdC8qKlxuXHQgKiBHZXQgbG9jYWwgZGF0YSBmb3Igcm91dGUgcmVzb2x2ZVxuXHQgKlxuXHQgKiBAcGFyYW0gSlNPTkRhdGEge2ZhY3Rvcnl9XG5cdCAqIEByZXR1cm5zIHtwcm9taXNlfSBkYXRhXG5cdCAqL1xuXHRmdW5jdGlvbiByZXNvbHZlTG9jYWxEYXRhKEpTT05EYXRhKSB7XG5cdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZGlyZWN0aXZlKCdsb2FkaW5nJywgbG9hZGluZyk7XG5cblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL2NvcmUvbG9hZGluZy50cGwuaHRtbCcsXG5cdFx0XHR0cmFuc2NsdWRlOiB0cnVlLFxuXHRcdFx0Y29udHJvbGxlcjogbG9hZGluZ0N0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdsb2FkaW5nJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiBsb2FkaW5nTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBsb2FkaW5nIExJTktcblx0XHQgKiBEaXNhYmxlcyBwYWdlIHNjcm9sbGluZyB3aGVuIGxvYWRpbmcgb3ZlcmxheSBpcyBvcGVuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XG5cdFx0ICogQHBhcmFtICRhdHRyc1xuXHRcdCAqIEBwYXJhbSBsb2FkaW5nIHtjb250cm9sbGVyfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGxvYWRpbmdMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgbG9hZGluZykge1xuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGl6ZSBkZWJvdW5jZWQgcmVzaXplXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gJHdhdGNoIGFjdGl2ZSBzdGF0ZVxuXHRcdFx0XHQkc2NvcGUuJHdhdGNoKCdsb2FkaW5nLmFjdGl2ZScsIF8kd2F0Y2hBY3RpdmUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdpbmRvdyByZXNpemVkXG5cdFx0XHQgKiBJZiBsb2FkaW5nLCByZWFwcGx5IGJvZHkgaGVpZ2h0XG5cdFx0XHQgKiB0byBwcmV2ZW50IHNjcm9sbGJhclxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cblx0XHRcdFx0aWYgKGxvYWRpbmcuYWN0aXZlKSB7XG5cdFx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXG5cdFx0XHRcdFx0XHRvdmVyZmxvd1k6ICdoaWRkZW4nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiAkd2F0Y2ggbG9hZGluZy5hY3RpdmVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsIHtib29sZWFufVxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbCB7dW5kZWZpbmVkfGJvb2xlYW59XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJHdhdGNoQWN0aXZlKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHRfb3BlbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBsb2FkaW5nXG5cdFx0XHQgKiBEaXNhYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuKCkge1xuXHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBsb2FkaW5nXG5cdFx0XHQgKiBFbmFibGUgc2Nyb2xsXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlKCkge1xuXHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRoZWlnaHQ6ICdhdXRvJyxcblx0XHRcdFx0XHRvdmVyZmxvd1k6ICdhdXRvJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRsb2FkaW5nQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblx0LyoqXG5cdCAqIGxvYWRpbmcgQ09OVFJPTExFUlxuXHQgKiBVcGRhdGUgdGhlIGxvYWRpbmcgc3RhdHVzIGJhc2VkXG5cdCAqIG9uIHJvdXRlQ2hhbmdlIHN0YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBsb2FkaW5nQ3RybCgkc2NvcGUpIHtcblx0XHR2YXIgbG9hZGluZyA9IHRoaXM7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9uJywgX2xvYWRpbmdBY3RpdmUpO1xuXHRcdFx0JHNjb3BlLiRvbignbG9hZGluZy1vZmYnLCBfbG9hZGluZ0luYWN0aXZlKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgbG9hZGluZyB0byBhY3RpdmVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdBY3RpdmUoKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gaW5hY3RpdmVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdJbmFjdGl2ZSgpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIEhlYWRlckN0cmwpO1xyXG5cclxuXHRIZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRsb2NhdGlvbicsICdKU09ORGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJDdHJsKCRsb2NhdGlvbiwgSlNPTkRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gaW5kZXhJc0FjdGl2ZTtcclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IG5hdklzQWN0aXZlO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBhY3RpdmF0ZSBjb250cm9sbGVyXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXBwbHkgY2xhc3MgdG8gaW5kZXggbmF2IGlmIGFjdGl2ZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluZGV4SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSAnLydcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09IHBhdGg7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBcHBseSBjbGFzcyB0byBjdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udHJvbGxlciBhY3RpdmF0ZVxyXG5cdFx0ICogR2V0IEpTT04gZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHsqfVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogU3VjY2Vzc2Z1bCBwcm9taXNlIGRhdGFcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRcdGhlYWRlci5qc29uID0gZGF0YTtcclxuXHRcdFx0XHRyZXR1cm4gaGVhZGVyLmpzb247XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2woJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIG5hdkNvbnRyb2wgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5hdkNvbnRyb2xMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBtb2RlbFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfJGJvZHkuZmluZCgnLmxheW91dC1jYW52YXMnKTtcblx0XHRcdHZhciBfbmF2T3BlbjtcblxuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdFx0dmFyIF9ycyA9IHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXG5cdFx0XHRcdFx0ZGVib3VuY2U6IDEwMFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIF8kbG9jYXRpb25DaGFuZ2VTdGFydCk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2l6ZWQgd2luZG93IChkZWJvdW5jZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKHtcblx0XHRcdFx0XHRtaW5IZWlnaHQ6ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1vcGVuJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xuXHRcdFx0XHRfJGJvZHlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1vcGVuJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlTmF2KCkge1xuXHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdoZW4gY2hhbmdpbmcgbG9jYXRpb24sIGNsb3NlIHRoZSBuYXYgaWYgaXQncyBvcGVuXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcblx0XHRcdFx0aWYgKF9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSB0b2dnbGVOYXY7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZShtcSkge1xuXHRcdFx0XHQvLyB1bmJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblxuXHRcdFx0XHRfJGJvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0Vycm9yNDA0Q3RybCcsIEVycm9yNDA0Q3RybCk7XG5cblx0RXJyb3I0MDRDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnXTtcblxuXHRmdW5jdGlvbiBFcnJvcjQwNEN0cmwoUGFnZSkge1xuXHRcdHZhciBlNDA0ID0gdGhpcztcblxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcblx0XHRlNDA0LnRpdGxlID0gJzQwNCAtIFBhZ2UgTm90IEZvdW5kJztcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cblx0XHRcdFBhZ2Uuc2V0VGl0bGUoZTQwNC50aXRsZSk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnR2xvYmFsT2JqJywgJ1BhZ2UnLCAnSlNPTkRhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoJHNjb3BlLCBHbG9iYWxPYmosIFBhZ2UsIEpTT05EYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aG9tZS50aXRsZSA9ICdIb21lJztcclxuXHRcdGhvbWUuZ2xvYmFsID0gR2xvYmFsT2JqO1xyXG5cdFx0aG9tZS5uYW1lID0gJ1Zpc2l0b3InO1xyXG5cdFx0aG9tZS5hbGVydEdyZWV0aW5nID0gR2xvYmFsT2JqLmFsZXJ0R3JlZXRpbmc7XHJcblx0XHRob21lLnN0cmluZ09mSFRNTCA9ICc8c3Ryb25nIHN0eWxlPVwiY29sb3I6IGdyZWVuO1wiPlNvbWUgZ3JlZW4gdGV4dDwvc3Ryb25nPiBib3VuZCBhcyBIVE1MIHdpdGggYSA8YSBocmVmPVwiI1wiPmxpbms8L2E+LCB0cnVzdGVkIHdpdGggU0NFISc7XHJcblx0XHRob21lLnZpZXdmb3JtYXQgPSBudWxsO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoaG9tZS50aXRsZSk7XHJcblxyXG5cdFx0XHQvLyBhY3RpdmF0ZSBjb250cm9sbGVyXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cclxuXHRcdFx0Ly8gbWVkaWFxdWVyeSBldmVudHNcclxuXHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcclxuXHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb250cm9sbGVyIGFjdGl2YXRlXHJcblx0XHQgKiBHZXQgSlNPTiBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMgeyp9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZGF0YVxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7anNvbn1cclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9nZXRKc29uU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdFx0aG9tZS5qc29uID0gZGF0YTtcclxuXHJcblx0XHRcdFx0Ly8gc3RvcCBsb2FkaW5nXHJcblx0XHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gaG9tZS5qc29uO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBzdGFydCBsb2FkaW5nXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vbicpO1xyXG5cclxuXHRcdFx0Ly8gZ2V0IHRoZSBkYXRhIGZyb20gSlNPTlxyXG5cdFx0XHRyZXR1cm4gSlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCkudGhlbihfZ2V0SnNvblN1Y2Nlc3MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRW50ZXIgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdzbWFsbCc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeGl0IHNtYWxsIG1xXHJcblx0XHQgKiBTZXQgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdsYXJnZSc7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1N1YkN0cmwnLCBTdWJDdHJsKTtcclxuXHJcblx0U3ViQ3RybC4kaW5qZWN0ID0gWydHbG9iYWxPYmonLCAnUGFnZScsICdyZXNvbHZlTG9jYWxEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIFN1YkN0cmwoR2xvYmFsT2JqLCBQYWdlLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgc3ViID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRzdWIudGl0bGUgPSAnU3VicGFnZSc7XHJcblx0XHRzdWIuZ2xvYmFsID0gR2xvYmFsT2JqO1xyXG5cdFx0c3ViLmpzb24gPSByZXNvbHZlTG9jYWxEYXRhO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoc3ViLnRpdGxlKTtcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7IiwiLyoqXHJcbiAqIERpcmVjdGl2ZXMgKGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMpIGFyZSBhbHdheXMgZGVjbGFyZWQgYXMgY2FtZWxDYXNlIGluIEpTIGFuZCBzbmFrZS1jYXNlIGluIEhUTUxcclxuICogQW5ndWxhcidzIGJ1aWx0LWluIDxhPiBkaXJlY3RpdmUgYXV0b21hdGljYWxseSBpbXBsZW1lbnRzIHByZXZlbnREZWZhdWx0IG9uIGxpbmtzIHRoYXQgZG9uJ3QgaGF2ZSBhbiBocmVmIGF0dHJpYnV0ZVxyXG4gKiBDb21wbGV4IEphdmFTY3JpcHQgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYWx3YXlzIGJlIGRvbmUgaW4gZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb25zLCBhbmQgJGFwcGx5IHNob3VsZCBuZXZlciBiZSB1c2VkIGluIGEgY29udHJvbGxlciEgU2ltcGxlIERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGJlIGluIHRoZSB2aWV3LlxyXG4gKi9cclxuXHJcbi8qLS0tIFNhbXBsZSBEaXJlY3RpdmUgd2l0aCBhICR3YXRjaCAtLS0qL1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5kaXJlY3RpdmUoJ3NhbXBsZURpcmVjdGl2ZScsIHNhbXBsZURpcmVjdGl2ZSk7XHJcblxyXG5cdHNhbXBsZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBzYW1wbGVEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvc3ViL3NhbXBsZS50cGwuaHRtbCcsXHJcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXHJcblx0XHRcdGNvbnRyb2xsZXI6IFNhbXBsZURpcmVjdGl2ZUN0cmwsXHJcblx0XHRcdGNvbnRyb2xsZXJBczogJ3NkJyxcclxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjoge1xyXG5cdFx0XHRcdGpzb25EYXRhOiAnPSdcclxuXHRcdFx0fSxcclxuXHRcdFx0bGluazogc2FtcGxlRGlyZWN0aXZlTGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIHNhbXBsZURpcmVjdGl2ZSBMSU5LIGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRzY29wZVxyXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XHJcblx0XHQgKiBAcGFyYW0gJGF0dHJzXHJcblx0XHQgKiBAcGFyYW0gc2Qge2NvbnRyb2xsZXJ9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZUxpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBzZCkge1xyXG5cdFx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0XHQvLyB3YXRjaCBmb3IgYXN5bmMgZGF0YSB0byBiZWNvbWUgYXZhaWxhYmxlIGFuZCB1cGRhdGVcclxuXHRcdFx0XHQkc2NvcGUuJHdhdGNoKCdzZC5qc29uRGF0YScsIF8kd2F0Y2hKc29uRGF0YSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiAkd2F0Y2ggZm9yIHNkLmpzb25EYXRhIHRvIGJlY29tZSBhdmFpbGFibGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Kn1cclxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn1cclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF8kd2F0Y2hKc29uRGF0YShuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcclxuXHRcdFx0XHRcdHNkLmpzb25EYXRhID0gbmV3VmFsO1xyXG5cclxuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnZGVtb25zdHJhdGUgJHRpbWVvdXQgaW5qZWN0aW9uIGluIGEgZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb24nKTtcclxuXHRcdFx0XHRcdH0sIDEwMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0U2FtcGxlRGlyZWN0aXZlQ3RybC4kaW5qZWN0ID0gW107XHJcblx0LyoqXHJcblx0ICogc2FtcGxlRGlyZWN0aXZlIENPTlRST0xMRVJcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBTYW1wbGVEaXJlY3RpdmVDdHJsKCkge1xyXG5cdFx0dmFyIHNkID0gdGhpcztcclxuXHJcblx0XHQvLyBjb250cm9sbGVyIGxvZ2ljIGdvZXMgaGVyZVxyXG5cdH1cclxuXHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9