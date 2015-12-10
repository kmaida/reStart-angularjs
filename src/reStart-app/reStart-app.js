// application module setter
(function() {
	'use strict';

	angular
		.module('reStart', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck', 'resize']);
}());
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page', '$scope', 'MQ', 'mediaCheck', '$log'];

	function PageCtrl(Page, $scope, MQ, mediaCheck, $log) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;
		// Set up functionality to run on enter/exit of media query
		var _mc = mediaCheck.init({
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
			if (next.$$route && next.$$route.resolve) { // eslint-disable-line angular/no-private-call
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
			_mc.matchCurrent(MQ.SMALL);

			if (current.$$route && current.$$route.resolve) {   // eslint-disable-line angular/no-private-call
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
			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			if (_handlingRouteChangeError) {
				return;
			}

			_handlingRouteChangeError = true;
			_loadingOff();

			$log.error(msg);
		}
		PageCtrl.enterMobile = _enterMobile;//test code
		PageCtrl.exitMobile = _exitMobile;//test code
		PageCtrl.loadingOn = _loadingOn;//test code
		PageCtrl.loadingOff = _loadingOff;//test code
		return PageCtrl;//test code
	}
}());
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('Page', Page);

	function Page() {
		// private vars
		var siteTitle = 'reStart Angular';
		var pageTitle = 'Home';

		// callable members
		return {
			getTitle: getTitle,
			setTitle: setTitle
		};

		/**
		 * Title function
		 * Sets site title and page title
		 *
		 * @returns {string} site title + page title
		 */
		function getTitle() {
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
}());
// "global" object to share between controllers
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('Utils', Utils);

	function Utils() {
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
}());
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
			.otherwise({
				templateUrl: 'reStart-app/pages/error404/Error404.view.html',
				controller: 'Error404Ctrl',
				controllerAs: 'e404'
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
}());
// fetch JSON data to share between controllers
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('JSONData', JSONData);

	JSONData.$inject = ['$http', 'Res'];

	function JSONData($http, Res) {
		// callable members
		return {
			getLocalData: getLocalData
		};

		/**
		 * GET local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getLocalData() {
			return $http
				.get('/data/data.json')
				.then(Res.success, Res.error);
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('Res', Res);

	function Res() {
		// callable members
		return {
			success: success,
			error: error
		};

		/**
		 * Promise response function
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 * Useful for APIs (ie, with nginx) where server error HTML page may be returned in error
		 *
		 * @param response {*} data from $http
		 * @returns {*} object, array
		 */
		function success(response) {
			if (angular.isObject(response.data)) {
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
		 */
		function error(error) {
			throw new Error('Error retrieving data', error);
		}
	}
}());
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
			templateUrl: 'reStart-app/core/ui/loading.tpl.html',
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
			// turn on loading for initial page load
			_loadingActive();

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

}());
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
}());
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
}());
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
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
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
			header.json = data;
			return header.json;
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
	}

}());
(function () {
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
			// private variables
			var _$body = angular.element('body');
			var _layoutCanvas = _$body.find('.layout-canvas');
			var _navOpen;

			// data model
			$scope.nav = {};

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

}());
(function () {
	'use strict';

	angular
		.module('reStart')
		.controller('Error404Ctrl', Error404Ctrl);

	Error404Ctrl.$inject = ['$scope', 'Page'];

	function Error404Ctrl($scope, Page) {
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

			// no data to load, but loading state might be on
			$scope.$emit('loading-off');
		}

		return {        //test code
			init: _init //test code
		};               //test code
	}
}());
(function () {
	'use strict';

	angular
		.module('reStart')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'Utils', 'Page', 'JSONData'];

	function HomeCtrl($scope, Utils, Page, JSONData) {
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

		function getView() {       //test code
			return home.viewformat; //test code
		}                           //test code

		home.enterMobile = _enterMobile;      //test code
		home.exitMobile = _exitMobile;        //test code
		home.getJsonSucess = _getJsonSuccess; //test code
		home.activate = _activate;            //test code
		home.getView = getView;               //test code

		return home;
	}
}());
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

}());
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['Utils', 'Page', 'resolveLocalData'];

	function SubCtrl(Utils, Page, resolveLocalData) {
		// controllerAs ViewModel
		var sub = this;

		// bindable members
		sub.title = 'Subpage';
		sub.global = Utils;
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
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL1BhZ2UuY3RybC5qcyIsImNvcmUvUGFnZS5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmNvbmZpZy5qcyIsImNvcmUvZ2V0LWRhdGEvSlNPTkRhdGEuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvUmVzLmZhY3RvcnkuanMiLCJjb3JlL3VpL2xvYWRpbmcuZGlyLmpzIiwiY29yZS91aS9NUS5jb25zdGFudC5qcyIsImNvcmUvdWkvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwibW9kdWxlcy9oZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJtb2R1bGVzL2hlYWRlci9uYXZDb250cm9sLmRpci5qcyIsInBhZ2VzL2Vycm9yNDA0L0Vycm9yNDA0LmN0cmwuanMiLCJwYWdlcy9ob21lL0hvbWUuY3RybC5qcyIsInBhZ2VzL3N1Yi9zYW1wbGUuZGlyLmpzIiwicGFnZXMvc3ViL1N1Yi5jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJyZVN0YXJ0LWFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcGxpY2F0aW9uIG1vZHVsZSBzZXR0ZXJcclxuKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcsIFsnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nU2FuaXRpemUnLCAnbWVkaWFDaGVjaycsICdyZXNpemUnXSk7XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XHJcblxyXG5cdFBhZ2VDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJHNjb3BlJywgJ01RJywgJ21lZGlhQ2hlY2snLCAnJGxvZyddO1xyXG5cclxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsIE1RLCBtZWRpYUNoZWNrLCAkbG9nKSB7XHJcblx0XHR2YXIgcGFnZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcclxuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XHJcblx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxyXG5cdFx0dmFyIF9tYyA9IG1lZGlhQ2hlY2suaW5pdCh7XHJcblx0XHRcdHNjb3BlOiAkc2NvcGUsXHJcblx0XHRcdG1lZGlhOiB7XHJcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxyXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJNb2JpbGUsXHJcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcclxuXHRcdFx0fSxcclxuXHRcdFx0ZGVib3VuY2U6IDIwMFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cclxuXHRcdFx0cGFnZS5wYWdlVGl0bGUgPSBQYWdlO1xyXG5cclxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XHJcblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBfcm91dGVDaGFuZ2VTdWNjZXNzKTtcclxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBfcm91dGVDaGFuZ2VFcnJvcik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcclxuXHRcdCAqICRicm9hZGNhc3QgJ2VudGVyLW1vYmlsZScgZXZlbnRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XHJcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEV4aXQgbW9iaWxlIG1lZGlhIHF1ZXJ5XHJcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LW1vYmlsZScgZXZlbnRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2V4aXQtbW9iaWxlJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUdXJuIG9uIGxvYWRpbmcgc3RhdGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xyXG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnbG9hZGluZy1vbicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVHVybiBvZmYgbG9hZGluZyBzdGF0ZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xyXG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnbG9hZGluZy1vZmYnKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdGFydCBoYW5kbGVyXHJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XHJcblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxyXG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZVN0YXJ0KCRldmVudCwgbmV4dCwgY3VycmVudCkge1xyXG5cdFx0XHRpZiAobmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5yZXNvbHZlKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcclxuXHRcdFx0XHRfbG9hZGluZ09uKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdWNjZXNzIGhhbmRsZXJcclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxyXG5cdFx0ICogSWYgY3VycmVudCByb3V0ZSBoYXMgYmVlbiByZXNvbHZlZCwgdHVybiBvZmYgbG9hZGluZ1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cclxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XHJcblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cykge1xyXG5cdFx0XHRfbWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcclxuXHJcblx0XHRcdGlmIChjdXJyZW50LiQkcm91dGUgJiYgY3VycmVudC4kJHJvdXRlLnJlc29sdmUpIHsgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGFuZ3VsYXIvbm8tcHJpdmF0ZS1jYWxsXHJcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUm91dGUgY2hhbmdlIGVycm9yIGhhbmRsZXJcclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxyXG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cclxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxyXG5cdFx0ICogQHBhcmFtIHJlamVjdGlvbiB7b2JqZWN0fVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlRXJyb3IoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cywgcmVqZWN0aW9uKSB7XHJcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0JztcclxuXHRcdFx0dmFyIG1zZyA9ICdFcnJvciByb3V0aW5nIHRvICcgKyBkZXN0aW5hdGlvbiArICcuICcgKyAocmVqZWN0aW9uLm1zZyB8fCAnJyk7XHJcblxyXG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XHJcblx0XHRcdF9sb2FkaW5nT2ZmKCk7XHJcblxyXG5cdFx0XHQkbG9nLmVycm9yKG1zZyk7XHJcblx0XHR9XHJcblx0XHRQYWdlQ3RybC5lbnRlck1vYmlsZSA9IF9lbnRlck1vYmlsZTsvL3Rlc3QgY29kZVxyXG5cdFx0UGFnZUN0cmwuZXhpdE1vYmlsZSA9IF9leGl0TW9iaWxlOy8vdGVzdCBjb2RlXHJcblx0XHRQYWdlQ3RybC5sb2FkaW5nT24gPSBfbG9hZGluZ09uOy8vdGVzdCBjb2RlXHJcblx0XHRQYWdlQ3RybC5sb2FkaW5nT2ZmID0gX2xvYWRpbmdPZmY7Ly90ZXN0IGNvZGVcclxuXHRcdHJldHVybiBQYWdlQ3RybDsvL3Rlc3QgY29kZVxyXG5cdH1cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5mYWN0b3J5KCdQYWdlJywgUGFnZSk7XHJcblxyXG5cdGZ1bmN0aW9uIFBhZ2UoKSB7XHJcblx0XHQvLyBwcml2YXRlIHZhcnNcclxuXHRcdHZhciBzaXRlVGl0bGUgPSAncmVTdGFydCBBbmd1bGFyJztcclxuXHRcdHZhciBwYWdlVGl0bGUgPSAnSG9tZSc7XHJcblxyXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0Z2V0VGl0bGU6IGdldFRpdGxlLFxyXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUaXRsZSBmdW5jdGlvblxyXG5cdFx0ICogU2V0cyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gc2l0ZSB0aXRsZSArIHBhZ2UgdGl0bGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0VGl0bGUoKSB7XHJcblx0XHRcdHJldHVybiBzaXRlVGl0bGUgKyAnIHwgJyArIHBhZ2VUaXRsZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCBwYWdlIHRpdGxlXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIG5ld1RpdGxlIHtzdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XHJcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiLCIvLyBcImdsb2JhbFwiIG9iamVjdCB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmZhY3RvcnkoJ1V0aWxzJywgVXRpbHMpO1xyXG5cclxuXHRmdW5jdGlvbiBVdGlscygpIHtcclxuXHRcdHZhciBncmVldGluZyA9ICdIZWxsbyc7XHJcblxyXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0Z3JlZXRpbmc6IGdyZWV0aW5nLFxyXG5cdFx0XHRhbGVydEdyZWV0aW5nOiBhbGVydEdyZWV0aW5nXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWxlcnQgZ3JlZXRpbmdcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gbmFtZSB7c3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBhbGVydEdyZWV0aW5nKG5hbWUpIHtcclxuXHRcdFx0YWxlcnQoZ3JlZXRpbmcgKyAnLCAnICsgbmFtZSArICchJyk7XHJcblx0XHR9XHJcblx0fVxyXG59KCkpOyIsIi8vIGFwcGxpY2F0aW9uIGNvbmZpZ1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcclxuXHJcblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XHJcblxyXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcclxuXHRcdCRyb3V0ZVByb3ZpZGVyXHJcblx0XHRcdC53aGVuKCcvJywge1xyXG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXHJcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcclxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQud2hlbignL3N1YnBhZ2UnLCB7XHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9zdWIvU3ViLnZpZXcuaHRtbCcsXHJcblx0XHRcdFx0Y29udHJvbGxlcjogJ1N1YkN0cmwnLFxyXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3N1YicsXHJcblx0XHRcdFx0cmVzb2x2ZToge1xyXG5cdFx0XHRcdFx0cmVzb2x2ZUxvY2FsRGF0YTogcmVzb2x2ZUxvY2FsRGF0YVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0Lm90aGVyd2lzZSh7XHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9lcnJvcjQwNC9FcnJvcjQwNC52aWV3Lmh0bWwnLFxyXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdFcnJvcjQwNEN0cmwnLFxyXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2U0MDQnXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXHJcblx0XHRcdC5odG1sNU1vZGUoe1xyXG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcclxuXHRcdFx0fSlcclxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcclxuXHR9XHJcblxyXG5cdHJlc29sdmVMb2NhbERhdGEuJGluamVjdCA9IFsnSlNPTkRhdGEnXTtcclxuXHQvKipcclxuXHQgKiBHZXQgbG9jYWwgZGF0YSBmb3Igcm91dGUgcmVzb2x2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIEpTT05EYXRhIHtmYWN0b3J5fVxyXG5cdCAqIEByZXR1cm5zIHtwcm9taXNlfSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gcmVzb2x2ZUxvY2FsRGF0YShKU09ORGF0YSkge1xyXG5cdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpO1xyXG5cdH1cclxufSgpKTsiLCIvLyBmZXRjaCBKU09OIGRhdGEgdG8gc2hhcmUgYmV0d2VlbiBjb250cm9sbGVyc1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5mYWN0b3J5KCdKU09ORGF0YScsIEpTT05EYXRhKTtcclxuXHJcblx0SlNPTkRhdGEuJGluamVjdCA9IFsnJGh0dHAnLCAnUmVzJ107XHJcblxyXG5cdGZ1bmN0aW9uIEpTT05EYXRhKCRodHRwLCBSZXMpIHtcclxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGdldExvY2FsRGF0YTogZ2V0TG9jYWxEYXRhXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR0VUIGxvY2FsIEpTT04gZGF0YSBmaWxlIGFuZCByZXR1cm4gcmVzdWx0c1xyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRMb2NhbERhdGEoKSB7XHJcblx0XHRcdHJldHVybiAkaHR0cFxyXG5cdFx0XHRcdC5nZXQoJy9kYXRhL2RhdGEuanNvbicpXHJcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XHJcblx0XHR9XHJcblx0fVxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmZhY3RvcnkoJ1JlcycsIFJlcyk7XHJcblxyXG5cdGZ1bmN0aW9uIFJlcygpIHtcclxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHN1Y2Nlc3M6IHN1Y2Nlc3MsXHJcblx0XHRcdGVycm9yOiBlcnJvclxyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cclxuXHRcdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XHJcblx0XHQgKiBVc2VmdWwgZm9yIEFQSXMgKGllLCB3aXRoIG5naW54KSB3aGVyZSBzZXJ2ZXIgZXJyb3IgSFRNTCBwYWdlIG1heSBiZSByZXR1cm5lZCBpbiBlcnJvclxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXHJcblx0XHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzdWNjZXNzKHJlc3BvbnNlKSB7XHJcblx0XHRcdGlmIChhbmd1bGFyLmlzT2JqZWN0KHJlc3BvbnNlLmRhdGEpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXHJcblx0XHQgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCBlcnJvciBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5kaXJlY3RpdmUoJ2xvYWRpbmcnLCBsb2FkaW5nKTtcclxuXHJcblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xyXG5cclxuXHRmdW5jdGlvbiBsb2FkaW5nKCR3aW5kb3csIHJlc2l6ZSkge1xyXG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHJlcGxhY2U6IHRydWUsXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvY29yZS91aS9sb2FkaW5nLnRwbC5odG1sJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcclxuXHRcdFx0Y29udHJvbGxlcjogbG9hZGluZ0N0cmwsXHJcblx0XHRcdGNvbnRyb2xsZXJBczogJ2xvYWRpbmcnLFxyXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxyXG5cdFx0XHRsaW5rOiBsb2FkaW5nTGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGxvYWRpbmcgTElOS1xyXG5cdFx0ICogRGlzYWJsZXMgcGFnZSBzY3JvbGxpbmcgd2hlbiBsb2FkaW5nIG92ZXJsYXkgaXMgb3BlblxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcclxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxyXG5cdFx0ICogQHBhcmFtICRhdHRyc1xyXG5cdFx0ICogQHBhcmFtIGxvYWRpbmcge2NvbnRyb2xsZXJ9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRpbmdMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgbG9hZGluZykge1xyXG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xyXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XHJcblx0XHRcdHZhciBfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XHJcblxyXG5cdFx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcclxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xyXG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcclxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXHJcblx0XHRcdFx0XHRkZWJvdW5jZTogMjAwXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdC8vICR3YXRjaCBhY3RpdmUgc3RhdGVcclxuXHRcdFx0XHQkc2NvcGUuJHdhdGNoKCdsb2FkaW5nLmFjdGl2ZScsIF8kd2F0Y2hBY3RpdmUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogV2luZG93IHJlc2l6ZWRcclxuXHRcdFx0ICogSWYgbG9hZGluZywgcmVhcHBseSBib2R5IGhlaWdodFxyXG5cdFx0XHQgKiB0byBwcmV2ZW50IHNjcm9sbGJhclxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XHJcblx0XHRcdFx0X3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xyXG5cclxuXHRcdFx0XHRpZiAobG9hZGluZy5hY3RpdmUpIHtcclxuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xyXG5cdFx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXHJcblx0XHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqICR3YXRjaCBsb2FkaW5nLmFjdGl2ZVxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsIHtib29sZWFufVxyXG5cdFx0XHQgKiBAcGFyYW0gb2xkVmFsIHt1bmRlZmluZWR8Ym9vbGVhbn1cclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF8kd2F0Y2hBY3RpdmUobmV3VmFsLCBvbGRWYWwpIHtcclxuXHRcdFx0XHRpZiAobmV3VmFsKSB7XHJcblx0XHRcdFx0XHRfb3BlbigpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRfY2xvc2UoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBPcGVuIGxvYWRpbmdcclxuXHRcdFx0ICogRGlzYWJsZSBzY3JvbGxcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9vcGVuKCkge1xyXG5cdFx0XHRcdF8kYm9keS5jc3Moe1xyXG5cdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxyXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogQ2xvc2UgbG9hZGluZ1xyXG5cdFx0XHQgKiBFbmFibGUgc2Nyb2xsXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2UoKSB7XHJcblx0XHRcdFx0XyRib2R5LmNzcyh7XHJcblx0XHRcdFx0XHRoZWlnaHQ6ICdhdXRvJyxcclxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2F1dG8nXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGxvYWRpbmdDdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xyXG5cdC8qKlxyXG5cdCAqIGxvYWRpbmcgQ09OVFJPTExFUlxyXG5cdCAqIFVwZGF0ZSB0aGUgbG9hZGluZyBzdGF0dXMgYmFzZWRcclxuXHQgKiBvbiByb3V0ZUNoYW5nZSBzdGF0ZVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGxvYWRpbmdDdHJsKCRzY29wZSkge1xyXG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyB0dXJuIG9uIGxvYWRpbmcgZm9yIGluaXRpYWwgcGFnZSBsb2FkXHJcblx0XHRcdF9sb2FkaW5nQWN0aXZlKCk7XHJcblxyXG5cdFx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9uJywgX2xvYWRpbmdBY3RpdmUpO1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9mZicsIF9sb2FkaW5nSW5hY3RpdmUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gYWN0aXZlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdBY3RpdmUoKSB7XHJcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGluYWN0aXZlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdJbmFjdGl2ZSgpIHtcclxuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdC8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xyXG5cdHZhciBNUSA9IHtcclxuXHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcclxuXHRcdExBUkdFOiAnKG1pbi13aWR0aDogNzY4cHgpJ1xyXG5cdH07XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnN0YW50KCdNUScsIE1RKTtcclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xyXG5cclxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XHJcblxyXG5cdGZ1bmN0aW9uIHRydXN0QXNIVE1MKCRzY2UpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XHJcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xyXG5cdFx0fTtcclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIEhlYWRlckN0cmwpO1xyXG5cclxuXHRIZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRsb2NhdGlvbicsICdKU09ORGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJDdHJsKCRsb2NhdGlvbiwgSlNPTkRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gaW5kZXhJc0FjdGl2ZTtcclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IG5hdklzQWN0aXZlO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBhY3RpdmF0ZSBjb250cm9sbGVyXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udHJvbGxlciBhY3RpdmF0ZVxyXG5cdFx0ICogR2V0IEpTT04gZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHsqfVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xyXG5cdFx0XHQvLyBnZXQgdGhlIGRhdGEgZnJvbSBKU09OXHJcblx0XHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKS50aGVuKF9nZXRKc29uU3VjY2Vzcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtqc29ufVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldEpzb25TdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aGVhZGVyLmpzb24gPSBkYXRhO1xyXG5cdFx0XHRyZXR1cm4gaGVhZGVyLmpzb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBcHBseSBjbGFzcyB0byBpbmRleCBuYXYgaWYgYWN0aXZlXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBuYXZJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpLnN1YnN0cigwLCBwYXRoLmxlbmd0aCkgPT09IHBhdGg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XHJcblxyXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcclxuXHJcblx0ZnVuY3Rpb24gbmF2Q29udHJvbCgkd2luZG93LCByZXNpemUpIHtcclxuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIG5hdkNvbnRyb2wgTElOSyBmdW5jdGlvblxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XHJcblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXHJcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcclxuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfJGJvZHkuZmluZCgnLmxheW91dC1jYW52YXMnKTtcclxuXHRcdFx0dmFyIF9uYXZPcGVuO1xyXG5cclxuXHRcdFx0Ly8gZGF0YSBtb2RlbFxyXG5cdFx0XHQkc2NvcGUubmF2ID0ge307XHJcblxyXG5cdFx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcclxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xyXG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcclxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXHJcblx0XHRcdFx0XHRkZWJvdW5jZTogMTAwXHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KTtcclxuXHRcdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xyXG5cdFx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogUmVzaXplZCB3aW5kb3cgKGRlYm91bmNlZClcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xyXG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKHtcclxuXHRcdFx0XHRcdG1pbkhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCArICdweCdcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xyXG5cdFx0XHRcdF8kYm9keVxyXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcclxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LW9wZW4nKTtcclxuXHJcblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogQ2xvc2UgbW9iaWxlIG5hdmlnYXRpb25cclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcclxuXHRcdFx0XHRfJGJvZHlcclxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxyXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XHJcblxyXG5cdFx0XHRcdF9uYXZPcGVuID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiB0b2dnbGVOYXYoKSB7XHJcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xyXG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogV2hlbiBjaGFuZ2luZyBsb2NhdGlvbiwgY2xvc2UgdGhlIG5hdiBpZiBpdCdzIG9wZW5cclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcclxuXHRcdFx0XHRpZiAoX25hdk9wZW4pIHtcclxuXHRcdFx0XHRcdF9jbG9zZU5hdigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBlbnRlcmluZyBtb2JpbGUgbWVkaWEgcXVlcnlcclxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcclxuXHRcdFx0XHRfY2xvc2VOYXYoKTtcclxuXHJcblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcclxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IHRvZ2dsZU5hdjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxyXG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKG1xKSB7XHJcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxyXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcclxuXHJcblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdFcnJvcjQwNEN0cmwnLCBFcnJvcjQwNEN0cmwpO1xyXG5cclxuXHRFcnJvcjQwNEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhZ2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gRXJyb3I0MDRDdHJsKCRzY29wZSwgUGFnZSkge1xyXG5cdFx0dmFyIGU0MDQgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGU0MDQudGl0bGUgPSAnNDA0IC0gUGFnZSBOb3QgRm91bmQnO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoZTQwNC50aXRsZSk7XHJcblxyXG5cdFx0XHQvLyBubyBkYXRhIHRvIGxvYWQsIGJ1dCBsb2FkaW5nIHN0YXRlIG1pZ2h0IGJlIG9uXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4geyAgICAgICAgLy90ZXN0IGNvZGVcclxuXHRcdFx0aW5pdDogX2luaXQgLy90ZXN0IGNvZGVcclxuXHRcdH07ICAgICAgICAgICAgICAgLy90ZXN0IGNvZGVcclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnVXRpbHMnLCAnUGFnZScsICdKU09ORGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybCgkc2NvcGUsIFV0aWxzLCBQYWdlLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhvbWUudGl0bGUgPSAnSG9tZSc7XHJcblx0XHRob21lLmdsb2JhbCA9IFV0aWxzO1xyXG5cdFx0aG9tZS5uYW1lID0gJ1Zpc2l0b3InO1xyXG5cdFx0aG9tZS5hbGVydEdyZWV0aW5nID0gVXRpbHMuYWxlcnRHcmVldGluZztcclxuXHRcdGhvbWUuc3RyaW5nT2ZIVE1MID0gJzxzdHJvbmcgc3R5bGU9XCJjb2xvcjogZ3JlZW47XCI+U29tZSBncmVlbiB0ZXh0PC9zdHJvbmc+IGJvdW5kIGFzIEhUTUwgd2l0aCBhIDxhIGhyZWY9XCIjXCI+bGluazwvYT4sIHRydXN0ZWQgd2l0aCBTQ0UhJztcclxuXHRcdGhvbWUudmlld2Zvcm1hdCA9IG51bGw7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFx0UGFnZS5zZXRUaXRsZShob21lLnRpdGxlKTtcclxuXHJcblx0XHRcdC8vIGFjdGl2YXRlIGNvbnRyb2xsZXJcclxuXHRcdFx0X2FjdGl2YXRlKCk7XHJcblxyXG5cdFx0XHQvLyBtZWRpYXF1ZXJ5IGV2ZW50c1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnRyb2xsZXIgYWN0aXZhdGVcclxuXHRcdCAqIEdldCBKU09OIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Kn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcclxuXHRcdFx0Ly8gc3RhcnQgbG9hZGluZ1xyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcclxuXHJcblx0XHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLmpzb24gPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gc3RvcCBsb2FkaW5nXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcclxuXHJcblx0XHRcdHJldHVybiBob21lLmpzb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEV4aXQgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBnZXRWaWV3KCkgeyAgICAgICAvL3Rlc3QgY29kZVxyXG5cdFx0XHRyZXR1cm4gaG9tZS52aWV3Zm9ybWF0OyAvL3Rlc3QgY29kZVxyXG5cdFx0fSAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGVzdCBjb2RlXHJcblxyXG5cdFx0aG9tZS5lbnRlck1vYmlsZSA9IF9lbnRlck1vYmlsZTsgICAgICAvL3Rlc3QgY29kZVxyXG5cdFx0aG9tZS5leGl0TW9iaWxlID0gX2V4aXRNb2JpbGU7ICAgICAgICAvL3Rlc3QgY29kZVxyXG5cdFx0aG9tZS5nZXRKc29uU3VjZXNzID0gX2dldEpzb25TdWNjZXNzOyAvL3Rlc3QgY29kZVxyXG5cdFx0aG9tZS5hY3RpdmF0ZSA9IF9hY3RpdmF0ZTsgICAgICAgICAgICAvL3Rlc3QgY29kZVxyXG5cdFx0aG9tZS5nZXRWaWV3ID0gZ2V0VmlldzsgICAgICAgICAgICAgICAvL3Rlc3QgY29kZVxyXG5cclxuXHRcdHJldHVybiBob21lO1xyXG5cdH1cclxufSgpKTsiLCIvKipcclxuICogRGlyZWN0aXZlcyAoYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlcykgYXJlIGFsd2F5cyBkZWNsYXJlZCBhcyBjYW1lbENhc2UgaW4gSlMgYW5kIHNuYWtlLWNhc2UgaW4gSFRNTFxyXG4gKiBBbmd1bGFyJ3MgYnVpbHQtaW4gPGE+IGRpcmVjdGl2ZSBhdXRvbWF0aWNhbGx5IGltcGxlbWVudHMgcHJldmVudERlZmF1bHQgb24gbGlua3MgdGhhdCBkb24ndCBoYXZlIGFuIGhyZWYgYXR0cmlidXRlXHJcbiAqIENvbXBsZXggSmF2YVNjcmlwdCBET00gbWFuaXB1bGF0aW9uIHNob3VsZCBhbHdheXMgYmUgZG9uZSBpbiBkaXJlY3RpdmUgbGluayBmdW5jdGlvbnMsIGFuZCAkYXBwbHkgc2hvdWxkIG5ldmVyIGJlIHVzZWQgaW4gYSBjb250cm9sbGVyISBTaW1wbGUgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYmUgaW4gdGhlIHZpZXcuXHJcbiAqL1xyXG5cclxuLyotLS0gU2FtcGxlIERpcmVjdGl2ZSB3aXRoIGEgJHdhdGNoIC0tLSovXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnc2FtcGxlRGlyZWN0aXZlJywgc2FtcGxlRGlyZWN0aXZlKTtcclxuXHJcblx0c2FtcGxlRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG5cdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZSgkdGltZW91dCkge1xyXG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHJlcGxhY2U6IHRydWUsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9zdWIvc2FtcGxlLnRwbC5odG1sJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcclxuXHRcdFx0Y29udHJvbGxlcjogU2FtcGxlRGlyZWN0aXZlQ3RybCxcclxuXHRcdFx0Y29udHJvbGxlckFzOiAnc2QnLFxyXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB7XHJcblx0XHRcdFx0anNvbkRhdGE6ICc9J1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRsaW5rOiBzYW1wbGVEaXJlY3RpdmVMaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogc2FtcGxlRGlyZWN0aXZlIExJTksgZnVuY3Rpb25cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gJHNjb3BlXHJcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcclxuXHRcdCAqIEBwYXJhbSBzZCB7Y29udHJvbGxlcn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2FtcGxlRGlyZWN0aXZlTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIHNkKSB7XHJcblx0XHRcdF9pbml0KCk7XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRcdC8vIHdhdGNoIGZvciBhc3luYyBkYXRhIHRvIGJlY29tZSBhdmFpbGFibGUgYW5kIHVwZGF0ZVxyXG5cdFx0XHRcdCRzY29wZS4kd2F0Y2goJ3NkLmpzb25EYXRhJywgXyR3YXRjaEpzb25EYXRhKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqICR3YXRjaCBmb3Igc2QuanNvbkRhdGEgdG8gYmVjb21lIGF2YWlsYWJsZVxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsIHsqfVxyXG5cdFx0XHQgKiBAcGFyYW0gb2xkVmFsIHsqfVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaEpzb25EYXRhKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xyXG5cdFx0XHRcdFx0c2QuanNvbkRhdGEgPSBuZXdWYWw7XHJcblxyXG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdkZW1vbnN0cmF0ZSAkdGltZW91dCBpbmplY3Rpb24gaW4gYSBkaXJlY3RpdmUgbGluayBmdW5jdGlvbicpO1xyXG5cdFx0XHRcdFx0fSwgMTAwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRTYW1wbGVEaXJlY3RpdmVDdHJsLiRpbmplY3QgPSBbXTtcclxuXHQvKipcclxuXHQgKiBzYW1wbGVEaXJlY3RpdmUgQ09OVFJPTExFUlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFNhbXBsZURpcmVjdGl2ZUN0cmwoKSB7XHJcblx0XHR2YXIgc2QgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGNvbnRyb2xsZXIgbG9naWMgZ29lcyBoZXJlXHJcblx0fVxyXG5cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdTdWJDdHJsJywgU3ViQ3RybCk7XHJcblxyXG5cdFN1YkN0cmwuJGluamVjdCA9IFsnVXRpbHMnLCAnUGFnZScsICdyZXNvbHZlTG9jYWxEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIFN1YkN0cmwoVXRpbHMsIFBhZ2UsIHJlc29sdmVMb2NhbERhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBzdWIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdHN1Yi50aXRsZSA9ICdTdWJwYWdlJztcclxuXHRcdHN1Yi5nbG9iYWwgPSBVdGlscztcclxuXHRcdHN1Yi5qc29uID0gcmVzb2x2ZUxvY2FsRGF0YTtcclxuXHJcblx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0Ly8gc2V0IHBhZ2UgPHRpdGxlPlxyXG5cdFx0XHRQYWdlLnNldFRpdGxlKHN1Yi50aXRsZSk7XHJcblx0XHR9XHJcblx0fVxyXG59KCkpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
