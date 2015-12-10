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
		return home;                          //test code
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL1BhZ2UuY3RybC5qcyIsImNvcmUvUGFnZS5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwibW9kdWxlcy9oZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJtb2R1bGVzL2hlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImNvcmUvYXBwLXNldHVwL2FwcC5jb25maWcuanMiLCJjb3JlL2dldC1kYXRhL0pTT05EYXRhLmZhY3RvcnkuanMiLCJjb3JlL2dldC1kYXRhL1Jlcy5mYWN0b3J5LmpzIiwiY29yZS91aS9sb2FkaW5nLmRpci5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsInBhZ2VzL2Vycm9yNDA0L0Vycm9yNDA0LmN0cmwuanMiLCJwYWdlcy9ob21lL0hvbWUuY3RybC5qcyIsInBhZ2VzL3N1Yi9zYW1wbGUuZGlyLmpzIiwicGFnZXMvc3ViL1N1Yi5jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicmVTdGFydC1hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHBsaWNhdGlvbiBtb2R1bGUgc2V0dGVyXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnLCBbJ25nUm91dGUnLCAnbmdSZXNvdXJjZScsICduZ1Nhbml0aXplJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJ10pO1xyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1BhZ2VDdHJsJywgUGFnZUN0cmwpO1xyXG5cclxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJywgJyRsb2cnXTtcclxuXHJcblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSwgJHNjb3BlLCBNUSwgbWVkaWFDaGVjaywgJGxvZykge1xyXG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xyXG5cclxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXHJcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xyXG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcclxuXHRcdHZhciBfbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xyXG5cdFx0XHRzY29wZTogJHNjb3BlLFxyXG5cdFx0XHRtZWRpYToge1xyXG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcclxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxyXG5cdFx0XHRcdGV4aXQ6IF9leGl0TW9iaWxlXHJcblx0XHRcdH0sXHJcblx0XHRcdGRlYm91bmNlOiAyMDBcclxuXHRcdH0pO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBhc3NvY2lhdGUgcGFnZSA8dGl0bGU+XHJcblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcclxuXHJcblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX3JvdXRlQ2hhbmdlU3RhcnQpO1xyXG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XHJcblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZUVycm9yJywgX3JvdXRlQ2hhbmdlRXJyb3IpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRW50ZXIgbW9iaWxlIG1lZGlhIHF1ZXJ5XHJcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xyXG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZW50ZXItbW9iaWxlJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxyXG5cdFx0ICogJGJyb2FkY2FzdCAnZXhpdC1tb2JpbGUnIGV2ZW50XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XHJcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVHVybiBvbiBsb2FkaW5nIHN0YXRlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPbigpIHtcclxuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFR1cm4gb2ZmIGxvYWRpbmcgc3RhdGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9hZGluZ09mZigpIHtcclxuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3RhcnQgaGFuZGxlclxyXG5cdFx0ICogSWYgbmV4dCByb3V0ZSBoYXMgcmVzb2x2ZSwgdHVybiBvbiBsb2FkaW5nXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxyXG5cdFx0ICogQHBhcmFtIG5leHQge29iamVjdH1cclxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcclxuXHRcdFx0aWYgKG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUucmVzb2x2ZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGFuZ3VsYXIvbm8tcHJpdmF0ZS1jYWxsXHJcblx0XHRcdFx0X2xvYWRpbmdPbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3VjY2VzcyBoYW5kbGVyXHJcblx0XHQgKiBNYXRjaCBjdXJyZW50IG1lZGlhIHF1ZXJ5IGFuZCBydW4gYXBwcm9wcmlhdGUgZnVuY3Rpb25cclxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XHJcblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxyXG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdWNjZXNzKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMpIHtcclxuXHRcdFx0X21jLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XHJcblxyXG5cdFx0XHRpZiAoY3VycmVudC4kJHJvdXRlICYmIGN1cnJlbnQuJCRyb3V0ZS5yZXNvbHZlKSB7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxyXG5cdFx0XHRcdF9sb2FkaW5nT2ZmKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJvdXRlIGNoYW5nZSBlcnJvciBoYW5kbGVyXHJcblx0XHQgKiBIYW5kbGUgcm91dGUgcmVzb2x2ZSBmYWlsdXJlc1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cclxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XHJcblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cclxuXHRcdCAqIEBwYXJhbSByZWplY3Rpb24ge29iamVjdH1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZUVycm9yKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMsIHJlamVjdGlvbikge1xyXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XHJcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xyXG5cclxuXHRcdFx0aWYgKF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xyXG5cdFx0XHRfbG9hZGluZ09mZigpO1xyXG5cclxuXHRcdFx0JGxvZy5lcnJvcihtc2cpO1xyXG5cdFx0fVxyXG5cdFx0UGFnZUN0cmwuZW50ZXJNb2JpbGUgPSBfZW50ZXJNb2JpbGU7Ly90ZXN0IGNvZGVcclxuXHRcdFBhZ2VDdHJsLmV4aXRNb2JpbGUgPSBfZXhpdE1vYmlsZTsvL3Rlc3QgY29kZVxyXG5cdFx0UGFnZUN0cmwubG9hZGluZ09uID0gX2xvYWRpbmdPbjsvL3Rlc3QgY29kZVxyXG5cdFx0UGFnZUN0cmwubG9hZGluZ09mZiA9IF9sb2FkaW5nT2ZmOy8vdGVzdCBjb2RlXHJcblx0XHRyZXR1cm4gUGFnZUN0cmw7Ly90ZXN0IGNvZGVcclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuZmFjdG9yeSgnUGFnZScsIFBhZ2UpO1xyXG5cclxuXHRmdW5jdGlvbiBQYWdlKCkge1xyXG5cdFx0Ly8gcHJpdmF0ZSB2YXJzXHJcblx0XHR2YXIgc2l0ZVRpdGxlID0gJ3JlU3RhcnQgQW5ndWxhcic7XHJcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0hvbWUnO1xyXG5cclxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGdldFRpdGxlOiBnZXRUaXRsZSxcclxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGl0bGUgZnVuY3Rpb25cclxuXHRcdCAqIFNldHMgc2l0ZSB0aXRsZSBhbmQgcGFnZSB0aXRsZVxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9IHNpdGUgdGl0bGUgKyBwYWdlIHRpdGxlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFRpdGxlKCkge1xyXG5cdFx0XHRyZXR1cm4gc2l0ZVRpdGxlICsgJyB8ICcgKyBwYWdlVGl0bGU7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgcGFnZSB0aXRsZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBuZXdUaXRsZSB7c3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xyXG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcclxuXHRcdH1cclxuXHR9XHJcbn0oKSk7IiwiLy8gXCJnbG9iYWxcIiBvYmplY3QgdG8gc2hhcmUgYmV0d2VlbiBjb250cm9sbGVyc1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcclxuXHJcblx0ZnVuY3Rpb24gVXRpbHMoKSB7XHJcblx0XHR2YXIgZ3JlZXRpbmcgPSAnSGVsbG8nO1xyXG5cclxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGdyZWV0aW5nOiBncmVldGluZyxcclxuXHRcdFx0YWxlcnRHcmVldGluZzogYWxlcnRHcmVldGluZ1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFsZXJ0IGdyZWV0aW5nXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIG5hbWUge3N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYWxlcnRHcmVldGluZyhuYW1lKSB7XHJcblx0XHRcdGFsZXJ0KGdyZWV0aW5nICsgJywgJyArIG5hbWUgKyAnIScpO1xyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgSGVhZGVyQ3RybCk7XHJcblxyXG5cdEhlYWRlckN0cmwuJGluamVjdCA9IFsnJGxvY2F0aW9uJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlckN0cmwoJGxvY2F0aW9uLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBpbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gbmF2SXNBY3RpdmU7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIGFjdGl2YXRlIGNvbnRyb2xsZXJcclxuXHRcdFx0X2FjdGl2YXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb250cm9sbGVyIGFjdGl2YXRlXHJcblx0XHQgKiBHZXQgSlNPTiBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMgeyp9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XHJcblx0XHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRoZWFkZXIuanNvbiA9IGRhdGE7XHJcblx0XHRcdHJldHVybiBoZWFkZXIuanNvbjtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGluZGV4IG5hdiBpZiBhY3RpdmVcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbmRleElzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXBwbHkgY2xhc3MgdG8gY3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG5hdklzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcclxuXHJcblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xyXG5cclxuXHRmdW5jdGlvbiBuYXZDb250cm9sKCR3aW5kb3csIHJlc2l6ZSkge1xyXG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogbmF2Q29udHJvbCBMSU5LIGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRzY29wZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcclxuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcclxuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xyXG5cdFx0XHR2YXIgX2xheW91dENhbnZhcyA9IF8kYm9keS5maW5kKCcubGF5b3V0LWNhbnZhcycpO1xyXG5cdFx0XHR2YXIgX25hdk9wZW47XHJcblxyXG5cdFx0XHQvLyBkYXRhIG1vZGVsXHJcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcclxuXHJcblx0XHRcdF9pbml0KCk7XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxyXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XHJcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxyXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcclxuXHRcdFx0XHRcdGRlYm91bmNlOiAxMDBcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQpO1xyXG5cdFx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XHJcblx0XHRcdFx0X2xheW91dENhbnZhcy5jc3Moe1xyXG5cdFx0XHRcdFx0bWluSGVpZ2h0OiAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4J1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XHJcblx0XHRcdFx0XyRib2R5XHJcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQnKVxyXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xyXG5cclxuXHRcdFx0XHRfbmF2T3BlbiA9IHRydWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xyXG5cdFx0XHRcdF8kYm9keVxyXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXHJcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcclxuXHJcblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcclxuXHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XHJcblx0XHRcdFx0XHRfb3Blbk5hdigpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KCkge1xyXG5cdFx0XHRcdGlmIChfbmF2T3Blbikge1xyXG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxyXG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZShtcSkge1xyXG5cdFx0XHRcdF9jbG9zZU5hdigpO1xyXG5cclxuXHRcdFx0XHQvLyBiaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxyXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XHJcblx0XHRcdCAqIERpc2FibGUgbWVudSB0b2dnbGluZyBhbmQgcmVtb3ZlIGJvZHkgY2xhc3Nlc1xyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcclxuXHRcdFx0XHQvLyB1bmJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXHJcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBudWxsO1xyXG5cclxuXHRcdFx0XHRfJGJvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiLy8gYXBwbGljYXRpb24gY29uZmlnXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xyXG5cclxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcclxuXHJcblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xyXG5cdFx0JHJvdXRlUHJvdmlkZXJcclxuXHRcdFx0LndoZW4oJy8nLCB7XHJcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9ob21lL0hvbWUudmlldy5odG1sJyxcclxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxyXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXHJcblx0XHRcdH0pXHJcblx0XHRcdC53aGVuKCcvc3VicGFnZScsIHtcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3BhZ2VzL3N1Yi9TdWIudmlldy5odG1sJyxcclxuXHRcdFx0XHRjb250cm9sbGVyOiAnU3ViQ3RybCcsXHJcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnc3ViJyxcclxuXHRcdFx0XHRyZXNvbHZlOiB7XHJcblx0XHRcdFx0XHRyZXNvbHZlTG9jYWxEYXRhOiByZXNvbHZlTG9jYWxEYXRhXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQub3RoZXJ3aXNlKHtcclxuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3BhZ2VzL2Vycm9yNDA0L0Vycm9yNDA0LnZpZXcuaHRtbCcsXHJcblx0XHRcdFx0Y29udHJvbGxlcjogJ0Vycm9yNDA0Q3RybCcsXHJcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZTQwNCdcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcclxuXHRcdFx0Lmh0bWw1TW9kZSh7XHJcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xyXG5cdH1cclxuXHJcblx0cmVzb2x2ZUxvY2FsRGF0YS4kaW5qZWN0ID0gWydKU09ORGF0YSddO1xyXG5cdC8qKlxyXG5cdCAqIEdldCBsb2NhbCBkYXRhIGZvciByb3V0ZSByZXNvbHZlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gSlNPTkRhdGEge2ZhY3Rvcnl9XHJcblx0ICogQHJldHVybnMge3Byb21pc2V9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiByZXNvbHZlTG9jYWxEYXRhKEpTT05EYXRhKSB7XHJcblx0XHRyZXR1cm4gSlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCk7XHJcblx0fVxyXG59KCkpOyIsIi8vIGZldGNoIEpTT04gZGF0YSB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmZhY3RvcnkoJ0pTT05EYXRhJywgSlNPTkRhdGEpO1xyXG5cclxuXHRKU09ORGF0YS4kaW5qZWN0ID0gWyckaHR0cCcsICdSZXMnXTtcclxuXHJcblx0ZnVuY3Rpb24gSlNPTkRhdGEoJGh0dHAsIFJlcykge1xyXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0Z2V0TG9jYWxEYXRhOiBnZXRMb2NhbERhdGFcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHRVQgbG9jYWwgSlNPTiBkYXRhIGZpbGUgYW5kIHJldHVybiByZXN1bHRzXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldExvY2FsRGF0YSgpIHtcclxuXHRcdFx0cmV0dXJuICRodHRwXHJcblx0XHRcdFx0LmdldCgnL2RhdGEvZGF0YS5qc29uJylcclxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcclxuXHRcdH1cclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuZmFjdG9yeSgnUmVzJywgUmVzKTtcclxuXHJcblx0ZnVuY3Rpb24gUmVzKCkge1xyXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3VjY2Vzczogc3VjY2VzcyxcclxuXHRcdFx0ZXJyb3I6IGVycm9yXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxyXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3RcclxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcclxuXHRcdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHN1Y2Nlc3MocmVzcG9uc2UpIHtcclxuXHRcdFx0aWYgKGFuZ3VsYXIuaXNPYmplY3QocmVzcG9uc2UuZGF0YSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uIC0gZXJyb3JcclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZXJyb3Ige29iamVjdH1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciByZXRyaWV2aW5nIGRhdGEnLCBlcnJvcik7XHJcblx0XHR9XHJcblx0fVxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnbG9hZGluZycsIGxvYWRpbmcpO1xyXG5cclxuXHRsb2FkaW5nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XHJcblxyXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XHJcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0cmVwbGFjZTogdHJ1ZSxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9jb3JlL3VpL2xvYWRpbmcudHBsLmh0bWwnLFxyXG5cdFx0XHR0cmFuc2NsdWRlOiB0cnVlLFxyXG5cdFx0XHRjb250cm9sbGVyOiBsb2FkaW5nQ3RybCxcclxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9hZGluZycsXHJcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcblx0XHRcdGxpbms6IGxvYWRpbmdMaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogbG9hZGluZyBMSU5LXHJcblx0XHQgKiBEaXNhYmxlcyBwYWdlIHNjcm9sbGluZyB3aGVuIGxvYWRpbmcgb3ZlcmxheSBpcyBvcGVuXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRzY29wZVxyXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XHJcblx0XHQgKiBAcGFyYW0gJGF0dHJzXHJcblx0XHQgKiBAcGFyYW0gbG9hZGluZyB7Y29udHJvbGxlcn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZGluZ0xpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBsb2FkaW5nKSB7XHJcblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXHJcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcclxuXHRcdFx0dmFyIF93aW5IZWlnaHQgPSAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcclxuXHJcblx0XHRcdF9pbml0KCk7XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxyXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XHJcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxyXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcclxuXHRcdFx0XHRcdGRlYm91bmNlOiAyMDBcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0Ly8gJHdhdGNoIGFjdGl2ZSBzdGF0ZVxyXG5cdFx0XHRcdCRzY29wZS4kd2F0Y2goJ2xvYWRpbmcuYWN0aXZlJywgXyR3YXRjaEFjdGl2ZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBXaW5kb3cgcmVzaXplZFxyXG5cdFx0XHQgKiBJZiBsb2FkaW5nLCByZWFwcGx5IGJvZHkgaGVpZ2h0XHJcblx0XHRcdCAqIHRvIHByZXZlbnQgc2Nyb2xsYmFyXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcclxuXHRcdFx0XHRfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XHJcblxyXG5cdFx0XHRcdGlmIChsb2FkaW5nLmFjdGl2ZSkge1xyXG5cdFx0XHRcdFx0XyRib2R5LmNzcyh7XHJcblx0XHRcdFx0XHRcdGhlaWdodDogX3dpbkhlaWdodCxcclxuXHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogJHdhdGNoIGxvYWRpbmcuYWN0aXZlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSBuZXdWYWwge2Jvb2xlYW59XHJcblx0XHRcdCAqIEBwYXJhbSBvbGRWYWwge3VuZGVmaW5lZHxib29sZWFufVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaEFjdGl2ZShuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcclxuXHRcdFx0XHRcdF9vcGVuKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdF9jbG9zZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIE9wZW4gbG9hZGluZ1xyXG5cdFx0XHQgKiBEaXNhYmxlIHNjcm9sbFxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX29wZW4oKSB7XHJcblx0XHRcdFx0XyRib2R5LmNzcyh7XHJcblx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXHJcblx0XHRcdFx0XHRvdmVyZmxvd1k6ICdoaWRkZW4nXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBDbG9zZSBsb2FkaW5nXHJcblx0XHRcdCAqIEVuYWJsZSBzY3JvbGxcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9jbG9zZSgpIHtcclxuXHRcdFx0XHRfJGJvZHkuY3NzKHtcclxuXHRcdFx0XHRcdGhlaWdodDogJ2F1dG8nLFxyXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnYXV0bydcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XHJcblx0LyoqXHJcblx0ICogbG9hZGluZyBDT05UUk9MTEVSXHJcblx0ICogVXBkYXRlIHRoZSBsb2FkaW5nIHN0YXR1cyBiYXNlZFxyXG5cdCAqIG9uIHJvdXRlQ2hhbmdlIHN0YXRlXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbG9hZGluZ0N0cmwoJHNjb3BlKSB7XHJcblx0XHR2YXIgbG9hZGluZyA9IHRoaXM7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHR1cm4gb24gbG9hZGluZyBmb3IgaW5pdGlhbCBwYWdlIGxvYWRcclxuXHRcdFx0X2xvYWRpbmdBY3RpdmUoKTtcclxuXHJcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb24nLCBfbG9hZGluZ0FjdGl2ZSk7XHJcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgX2xvYWRpbmdJbmFjdGl2ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgbG9hZGluZyB0byBhY3RpdmVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9hZGluZ0FjdGl2ZSgpIHtcclxuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gaW5hY3RpdmVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9hZGluZ0luYWN0aXZlKCkge1xyXG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0Ly8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXHJcblx0dmFyIE1RID0ge1xyXG5cdFx0U01BTEw6ICcobWF4LXdpZHRoOiA3NjdweCknLFxyXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXHJcblx0fTtcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29uc3RhbnQoJ01RJywgTVEpO1xyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmZpbHRlcigndHJ1c3RBc0hUTUwnLCB0cnVzdEFzSFRNTCk7XHJcblxyXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcclxuXHRcdFx0cmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dCk7XHJcblx0XHR9O1xyXG5cdH1cclxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignRXJyb3I0MDRDdHJsJywgRXJyb3I0MDRDdHJsKTtcclxuXHJcblx0RXJyb3I0MDRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYWdlJ107XHJcblxyXG5cdGZ1bmN0aW9uIEVycm9yNDA0Q3RybCgkc2NvcGUsIFBhZ2UpIHtcclxuXHRcdHZhciBlNDA0ID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRlNDA0LnRpdGxlID0gJzQwNCAtIFBhZ2UgTm90IEZvdW5kJztcclxuXHJcblx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0Ly8gc2V0IHBhZ2UgPHRpdGxlPlxyXG5cdFx0XHRQYWdlLnNldFRpdGxlKGU0MDQudGl0bGUpO1xyXG5cclxuXHRcdFx0Ly8gbm8gZGF0YSB0byBsb2FkLCBidXQgbG9hZGluZyBzdGF0ZSBtaWdodCBiZSBvblxyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHsgICAgICAgIC8vdGVzdCBjb2RlXHJcblx0XHRcdGluaXQ6IF9pbml0IC8vdGVzdCBjb2RlXHJcblx0XHR9OyAgICAgICAgICAgICAgIC8vdGVzdCBjb2RlXHJcblx0fVxyXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1V0aWxzJywgJ1BhZ2UnLCAnSlNPTkRhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoJHNjb3BlLCBVdGlscywgUGFnZSwgSlNPTkRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRob21lLnRpdGxlID0gJ0hvbWUnO1xyXG5cdFx0aG9tZS5nbG9iYWwgPSBVdGlscztcclxuXHRcdGhvbWUubmFtZSA9ICdWaXNpdG9yJztcclxuXHRcdGhvbWUuYWxlcnRHcmVldGluZyA9IFV0aWxzLmFsZXJ0R3JlZXRpbmc7XHJcblx0XHRob21lLnN0cmluZ09mSFRNTCA9ICc8c3Ryb25nIHN0eWxlPVwiY29sb3I6IGdyZWVuO1wiPlNvbWUgZ3JlZW4gdGV4dDwvc3Ryb25nPiBib3VuZCBhcyBIVE1MIHdpdGggYSA8YSBocmVmPVwiI1wiPmxpbms8L2E+LCB0cnVzdGVkIHdpdGggU0NFISc7XHJcblx0XHRob21lLnZpZXdmb3JtYXQgPSBudWxsO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoaG9tZS50aXRsZSk7XHJcblxyXG5cdFx0XHQvLyBhY3RpdmF0ZSBjb250cm9sbGVyXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cclxuXHRcdFx0Ly8gbWVkaWFxdWVyeSBldmVudHNcclxuXHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcclxuXHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb250cm9sbGVyIGFjdGl2YXRlXHJcblx0XHQgKiBHZXQgSlNPTiBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMgeyp9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XHJcblx0XHRcdC8vIHN0YXJ0IGxvYWRpbmdcclxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XHJcblxyXG5cdFx0XHQvLyBnZXQgdGhlIGRhdGEgZnJvbSBKU09OXHJcblx0XHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKS50aGVuKF9nZXRKc29uU3VjY2Vzcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtqc29ufVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldEpzb25TdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5qc29uID0gZGF0YTtcclxuXHJcblx0XHRcdC8vIHN0b3AgbG9hZGluZ1xyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gaG9tZS5qc29uO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRW50ZXIgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdzbWFsbCc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeGl0IHNtYWxsIG1xXHJcblx0XHQgKiBTZXQgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdsYXJnZSc7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0VmlldygpIHsgICAgICAgLy90ZXN0IGNvZGVcclxuXHRcdFx0cmV0dXJuIGhvbWUudmlld2Zvcm1hdDsgLy90ZXN0IGNvZGVcclxuXHRcdH0gICAgICAgICAgICAgICAgICAgICAgICAgICAvL3Rlc3QgY29kZVxyXG5cclxuXHRcdGhvbWUuZW50ZXJNb2JpbGUgPSBfZW50ZXJNb2JpbGU7ICAgICAgLy90ZXN0IGNvZGVcclxuXHRcdGhvbWUuZXhpdE1vYmlsZSA9IF9leGl0TW9iaWxlOyAgICAgICAgLy90ZXN0IGNvZGVcclxuXHRcdGhvbWUuZ2V0SnNvblN1Y2VzcyA9IF9nZXRKc29uU3VjY2VzczsgLy90ZXN0IGNvZGVcclxuXHRcdGhvbWUuYWN0aXZhdGUgPSBfYWN0aXZhdGU7ICAgICAgICAgICAgLy90ZXN0IGNvZGVcclxuXHRcdGhvbWUuZ2V0VmlldyA9IGdldFZpZXc7ICAgICAgICAgICAgICAgLy90ZXN0IGNvZGVcclxuXHRcdHJldHVybiBob21lOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy90ZXN0IGNvZGVcclxuXHR9XHJcbn0oKSk7IiwiLyoqXHJcbiAqIERpcmVjdGl2ZXMgKGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMpIGFyZSBhbHdheXMgZGVjbGFyZWQgYXMgY2FtZWxDYXNlIGluIEpTIGFuZCBzbmFrZS1jYXNlIGluIEhUTUxcclxuICogQW5ndWxhcidzIGJ1aWx0LWluIDxhPiBkaXJlY3RpdmUgYXV0b21hdGljYWxseSBpbXBsZW1lbnRzIHByZXZlbnREZWZhdWx0IG9uIGxpbmtzIHRoYXQgZG9uJ3QgaGF2ZSBhbiBocmVmIGF0dHJpYnV0ZVxyXG4gKiBDb21wbGV4IEphdmFTY3JpcHQgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYWx3YXlzIGJlIGRvbmUgaW4gZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb25zLCBhbmQgJGFwcGx5IHNob3VsZCBuZXZlciBiZSB1c2VkIGluIGEgY29udHJvbGxlciEgU2ltcGxlIERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGJlIGluIHRoZSB2aWV3LlxyXG4gKi9cclxuXHJcbi8qLS0tIFNhbXBsZSBEaXJlY3RpdmUgd2l0aCBhICR3YXRjaCAtLS0qL1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5kaXJlY3RpdmUoJ3NhbXBsZURpcmVjdGl2ZScsIHNhbXBsZURpcmVjdGl2ZSk7XHJcblxyXG5cdHNhbXBsZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBzYW1wbGVEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvc3ViL3NhbXBsZS50cGwuaHRtbCcsXHJcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXHJcblx0XHRcdGNvbnRyb2xsZXI6IFNhbXBsZURpcmVjdGl2ZUN0cmwsXHJcblx0XHRcdGNvbnRyb2xsZXJBczogJ3NkJyxcclxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjoge1xyXG5cdFx0XHRcdGpzb25EYXRhOiAnPSdcclxuXHRcdFx0fSxcclxuXHRcdFx0bGluazogc2FtcGxlRGlyZWN0aXZlTGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIHNhbXBsZURpcmVjdGl2ZSBMSU5LIGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRzY29wZVxyXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XHJcblx0XHQgKiBAcGFyYW0gJGF0dHJzXHJcblx0XHQgKiBAcGFyYW0gc2Qge2NvbnRyb2xsZXJ9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZUxpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBzZCkge1xyXG5cdFx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0XHQvLyB3YXRjaCBmb3IgYXN5bmMgZGF0YSB0byBiZWNvbWUgYXZhaWxhYmxlIGFuZCB1cGRhdGVcclxuXHRcdFx0XHQkc2NvcGUuJHdhdGNoKCdzZC5qc29uRGF0YScsIF8kd2F0Y2hKc29uRGF0YSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiAkd2F0Y2ggZm9yIHNkLmpzb25EYXRhIHRvIGJlY29tZSBhdmFpbGFibGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Kn1cclxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn1cclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF8kd2F0Y2hKc29uRGF0YShuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcclxuXHRcdFx0XHRcdHNkLmpzb25EYXRhID0gbmV3VmFsO1xyXG5cclxuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnZGVtb25zdHJhdGUgJHRpbWVvdXQgaW5qZWN0aW9uIGluIGEgZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb24nKTtcclxuXHRcdFx0XHRcdH0sIDEwMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0U2FtcGxlRGlyZWN0aXZlQ3RybC4kaW5qZWN0ID0gW107XHJcblx0LyoqXHJcblx0ICogc2FtcGxlRGlyZWN0aXZlIENPTlRST0xMRVJcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBTYW1wbGVEaXJlY3RpdmVDdHJsKCkge1xyXG5cdFx0dmFyIHNkID0gdGhpcztcclxuXHJcblx0XHQvLyBjb250cm9sbGVyIGxvZ2ljIGdvZXMgaGVyZVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignU3ViQ3RybCcsIFN1YkN0cmwpO1xyXG5cclxuXHRTdWJDdHJsLiRpbmplY3QgPSBbJ1V0aWxzJywgJ1BhZ2UnLCAncmVzb2x2ZUxvY2FsRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBTdWJDdHJsKFV0aWxzLCBQYWdlLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgc3ViID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRzdWIudGl0bGUgPSAnU3VicGFnZSc7XHJcblx0XHRzdWIuZ2xvYmFsID0gVXRpbHM7XHJcblx0XHRzdWIuanNvbiA9IHJlc29sdmVMb2NhbERhdGE7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFx0UGFnZS5zZXRUaXRsZShzdWIudGl0bGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
