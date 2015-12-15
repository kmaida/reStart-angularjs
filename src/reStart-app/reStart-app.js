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
	}
}());
(function() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL1BhZ2UuY3RybC5qcyIsImNvcmUvUGFnZS5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLmNvbmZpZy5qcyIsImNvcmUvZ2V0LWRhdGEvSlNPTkRhdGEuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvUmVzLmZhY3RvcnkuanMiLCJjb3JlL3VpL01RLmNvbnN0YW50LmpzIiwiY29yZS91aS9sb2FkaW5nLmRpci5qcyIsImNvcmUvdWkvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwicGFnZXMvZXJyb3I0MDQvRXJyb3I0MDQuY3RybC5qcyIsInBhZ2VzL2hvbWUvSG9tZS5jdHJsLmpzIiwicGFnZXMvc3ViL1N1Yi5jdHJsLmpzIiwicGFnZXMvc3ViL3NhbXBsZS5kaXIuanMiLCJtb2R1bGVzL2hlYWRlci9IZWFkZXIuY3RybC5qcyIsIm1vZHVsZXMvaGVhZGVyL25hdkNvbnRyb2wuZGlyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJyZVN0YXJ0LWFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcGxpY2F0aW9uIG1vZHVsZSBzZXR0ZXJcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICdtZWRpYUNoZWNrJywgJ3Jlc2l6ZSddKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJywgJyRsb2cnXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsIE1RLCBtZWRpYUNoZWNrLCAkbG9nKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xuXHRcdC8vIFNldCB1cCBmdW5jdGlvbmFsaXR5IHRvIHJ1biBvbiBlbnRlci9leGl0IG9mIG1lZGlhIHF1ZXJ5XG5cdFx0dmFyIF9tYyA9IG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bWVkaWE6IHtcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSxcblx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHR9KTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb24gbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9mZiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN0YXJ0IGhhbmRsZXJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0LiQkcm91dGUgJiYgbmV4dC4kJHJvdXRlLnJlc29sdmUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHRfbG9hZGluZ09uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN1Y2Nlc3MgaGFuZGxlclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRfbWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblxuXHRcdFx0aWYgKGN1cnJlbnQuJCRyb3V0ZSAmJiBjdXJyZW50LiQkcm91dGUucmVzb2x2ZSkgeyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXHRcdFx0X2xvYWRpbmdPZmYoKTtcblxuXHRcdFx0JGxvZy5lcnJvcihtc2cpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdC8vIHByaXZhdGUgdmFyc1xuXHRcdHZhciBzaXRlVGl0bGUgPSAncmVTdGFydCBBbmd1bGFyJztcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0hvbWUnO1xuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRUaXRsZTogZ2V0VGl0bGUsXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVGl0bGUgZnVuY3Rpb25cblx0XHQgKiBTZXRzIHNpdGUgdGl0bGUgYW5kIHBhZ2UgdGl0bGVcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9IHNpdGUgdGl0bGUgKyBwYWdlIHRpdGxlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0VGl0bGUoKSB7XG5cdFx0XHRyZXR1cm4gc2l0ZVRpdGxlICsgJyB8ICcgKyBwYWdlVGl0bGU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IHBhZ2UgdGl0bGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdUaXRsZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiLy8gXCJnbG9iYWxcIiBvYmplY3QgdG8gc2hhcmUgYmV0d2VlbiBjb250cm9sbGVyc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcblxuXHRmdW5jdGlvbiBVdGlscygpIHtcblx0XHR2YXIgZ3JlZXRpbmcgPSAnSGVsbG8nO1xuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRncmVldGluZzogZ3JlZXRpbmcsXG5cdFx0XHRhbGVydEdyZWV0aW5nOiBhbGVydEdyZWV0aW5nXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEFsZXJ0IGdyZWV0aW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmFtZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGFsZXJ0R3JlZXRpbmcobmFtZSkge1xuXHRcdFx0YWxlcnQoZ3JlZXRpbmcgKyAnLCAnICsgbmFtZSArICchJyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIi8vIGFwcGxpY2F0aW9uIGNvbmZpZ1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3BhZ2VzL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvc3VicGFnZScsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9zdWIvU3ViLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdTdWJDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnc3ViJyxcblx0XHRcdFx0cmVzb2x2ZToge1xuXHRcdFx0XHRcdHJlc29sdmVMb2NhbERhdGE6IHJlc29sdmVMb2NhbERhdGFcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3BhZ2VzL2Vycm9yNDA0L0Vycm9yNDA0LnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdFcnJvcjQwNEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlNDA0J1xuXHRcdFx0fSk7XG5cblx0XHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdFx0Lmh0bWw1TW9kZSh7XG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xuXHR9XG5cblx0cmVzb2x2ZUxvY2FsRGF0YS4kaW5qZWN0ID0gWydKU09ORGF0YSddO1xuXHQvKipcblx0ICogR2V0IGxvY2FsIGRhdGEgZm9yIHJvdXRlIHJlc29sdmVcblx0ICpcblx0ICogQHBhcmFtIEpTT05EYXRhIHtmYWN0b3J5fVxuXHQgKiBAcmV0dXJucyB7cHJvbWlzZX0gZGF0YVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzb2x2ZUxvY2FsRGF0YShKU09ORGF0YSkge1xuXHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKTtcblx0fVxufSgpKTsiLCIvLyBmZXRjaCBKU09OIGRhdGEgdG8gc2hhcmUgYmV0d2VlbiBjb250cm9sbGVyc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5mYWN0b3J5KCdKU09ORGF0YScsIEpTT05EYXRhKTtcblxuXHRKU09ORGF0YS4kaW5qZWN0ID0gWyckaHR0cCcsICdSZXMnXTtcblxuXHRmdW5jdGlvbiBKU09ORGF0YSgkaHR0cCwgUmVzKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRMb2NhbERhdGE6IGdldExvY2FsRGF0YVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHRVQgbG9jYWwgSlNPTiBkYXRhIGZpbGUgYW5kIHJldHVybiByZXN1bHRzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRMb2NhbERhdGEoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2RhdGEvZGF0YS5qc29uJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZmFjdG9yeSgnUmVzJywgUmVzKTtcblxuXHRmdW5jdGlvbiBSZXMoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRzdWNjZXNzOiBzdWNjZXNzLFxuXHRcdFx0ZXJyb3I6IGVycm9yXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKGFuZ3VsYXIuaXNPYmplY3QocmVzcG9uc2UuZGF0YSkpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGVycm9yKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0Ly8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb25zdGFudCgnTVEnLCBNUSk7XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZGlyZWN0aXZlKCdsb2FkaW5nJywgbG9hZGluZyk7XG5cblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL2NvcmUvdWkvbG9hZGluZy50cGwuaHRtbCcsXG5cdFx0XHR0cmFuc2NsdWRlOiB0cnVlLFxuXHRcdFx0Y29udHJvbGxlcjogbG9hZGluZ0N0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdsb2FkaW5nJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiBsb2FkaW5nTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBsb2FkaW5nIExJTktcblx0XHQgKiBEaXNhYmxlcyBwYWdlIHNjcm9sbGluZyB3aGVuIGxvYWRpbmcgb3ZlcmxheSBpcyBvcGVuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XG5cdFx0ICogQHBhcmFtICRhdHRyc1xuXHRcdCAqIEBwYXJhbSBsb2FkaW5nIHtjb250cm9sbGVyfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGxvYWRpbmdMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgbG9hZGluZykge1xuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGl6ZSBkZWJvdW5jZWQgcmVzaXplXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gJHdhdGNoIGFjdGl2ZSBzdGF0ZVxuXHRcdFx0XHQkc2NvcGUuJHdhdGNoKCdsb2FkaW5nLmFjdGl2ZScsIF8kd2F0Y2hBY3RpdmUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdpbmRvdyByZXNpemVkXG5cdFx0XHQgKiBJZiBsb2FkaW5nLCByZWFwcGx5IGJvZHkgaGVpZ2h0XG5cdFx0XHQgKiB0byBwcmV2ZW50IHNjcm9sbGJhclxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cblx0XHRcdFx0aWYgKGxvYWRpbmcuYWN0aXZlKSB7XG5cdFx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXG5cdFx0XHRcdFx0XHRvdmVyZmxvd1k6ICdoaWRkZW4nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiAkd2F0Y2ggbG9hZGluZy5hY3RpdmVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsIHtib29sZWFufVxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbCB7dW5kZWZpbmVkfGJvb2xlYW59XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJHdhdGNoQWN0aXZlKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHRfb3BlbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBsb2FkaW5nXG5cdFx0XHQgKiBEaXNhYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuKCkge1xuXHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBsb2FkaW5nXG5cdFx0XHQgKiBFbmFibGUgc2Nyb2xsXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlKCkge1xuXHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRoZWlnaHQ6ICdhdXRvJyxcblx0XHRcdFx0XHRvdmVyZmxvd1k6ICdhdXRvJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRsb2FkaW5nQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblx0LyoqXG5cdCAqIGxvYWRpbmcgQ09OVFJPTExFUlxuXHQgKiBVcGRhdGUgdGhlIGxvYWRpbmcgc3RhdHVzIGJhc2VkXG5cdCAqIG9uIHJvdXRlQ2hhbmdlIHN0YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBsb2FkaW5nQ3RybCgkc2NvcGUpIHtcblx0XHR2YXIgbG9hZGluZyA9IHRoaXM7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyB0dXJuIG9uIGxvYWRpbmcgZm9yIGluaXRpYWwgcGFnZSBsb2FkXG5cdFx0XHRfbG9hZGluZ0FjdGl2ZSgpO1xuXG5cdFx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9uJywgX2xvYWRpbmdBY3RpdmUpO1xuXHRcdFx0JHNjb3BlLiRvbignbG9hZGluZy1vZmYnLCBfbG9hZGluZ0luYWN0aXZlKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgbG9hZGluZyB0byBhY3RpdmVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdBY3RpdmUoKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gaW5hY3RpdmVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdJbmFjdGl2ZSgpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb250cm9sbGVyKCdFcnJvcjQwNEN0cmwnLCBFcnJvcjQwNEN0cmwpO1xuXG5cdEVycm9yNDA0Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIEVycm9yNDA0Q3RybCgkc2NvcGUsIFBhZ2UpIHtcblx0XHR2YXIgZTQwNCA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0ZTQwNC50aXRsZSA9ICc0MDQgLSBQYWdlIE5vdCBGb3VuZCc7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XG5cdFx0XHRQYWdlLnNldFRpdGxlKGU0MDQudGl0bGUpO1xuXG5cdFx0XHQvLyBubyBkYXRhIHRvIGxvYWQsIGJ1dCBsb2FkaW5nIHN0YXRlIG1pZ2h0IGJlIG9uXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnVXRpbHMnLCAnUGFnZScsICdKU09ORGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybCgkc2NvcGUsIFV0aWxzLCBQYWdlLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhvbWUudGl0bGUgPSAnSG9tZSc7XHJcblx0XHRob21lLmdsb2JhbCA9IFV0aWxzO1xyXG5cdFx0aG9tZS5uYW1lID0gJ1Zpc2l0b3InO1xyXG5cdFx0aG9tZS5hbGVydEdyZWV0aW5nID0gVXRpbHMuYWxlcnRHcmVldGluZztcclxuXHRcdGhvbWUuc3RyaW5nT2ZIVE1MID0gJzxzdHJvbmcgc3R5bGU9XCJjb2xvcjogZ3JlZW47XCI+U29tZSBncmVlbiB0ZXh0PC9zdHJvbmc+IGJvdW5kIGFzIEhUTUwgd2l0aCBhIDxhIGhyZWY9XCIjXCI+bGluazwvYT4sIHRydXN0ZWQgd2l0aCBTQ0UhJztcclxuXHRcdGhvbWUudmlld2Zvcm1hdCA9IG51bGw7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFx0UGFnZS5zZXRUaXRsZShob21lLnRpdGxlKTtcclxuXHJcblx0XHRcdC8vIGFjdGl2YXRlIGNvbnRyb2xsZXJcclxuXHRcdFx0X2FjdGl2YXRlKCk7XHJcblxyXG5cdFx0XHQvLyBtZWRpYXF1ZXJ5IGV2ZW50c1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnRyb2xsZXIgYWN0aXZhdGVcclxuXHRcdCAqIEdldCBKU09OIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Kn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcclxuXHRcdFx0Ly8gc3RhcnQgbG9hZGluZ1xyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcclxuXHJcblx0XHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLmpzb24gPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gc3RvcCBsb2FkaW5nXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcclxuXHJcblx0XHRcdHJldHVybiBob21lLmpzb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEV4aXQgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcclxuXHRcdH1cclxuXHR9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignU3ViQ3RybCcsIFN1YkN0cmwpO1xyXG5cclxuXHRTdWJDdHJsLiRpbmplY3QgPSBbJ1V0aWxzJywgJ1BhZ2UnLCAncmVzb2x2ZUxvY2FsRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBTdWJDdHJsKFV0aWxzLCBQYWdlLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgc3ViID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRzdWIudGl0bGUgPSAnU3VicGFnZSc7XHJcblx0XHRzdWIuZ2xvYmFsID0gVXRpbHM7XHJcblx0XHRzdWIuanNvbiA9IHJlc29sdmVMb2NhbERhdGE7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFx0UGFnZS5zZXRUaXRsZShzdWIudGl0bGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiLCIvKipcclxuICogRGlyZWN0aXZlcyAoYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlcykgYXJlIGFsd2F5cyBkZWNsYXJlZCBhcyBjYW1lbENhc2UgaW4gSlMgYW5kIHNuYWtlLWNhc2UgaW4gSFRNTFxyXG4gKiBBbmd1bGFyJ3MgYnVpbHQtaW4gPGE+IGRpcmVjdGl2ZSBhdXRvbWF0aWNhbGx5IGltcGxlbWVudHMgcHJldmVudERlZmF1bHQgb24gbGlua3MgdGhhdCBkb24ndCBoYXZlIGFuIGhyZWYgYXR0cmlidXRlXHJcbiAqIENvbXBsZXggSmF2YVNjcmlwdCBET00gbWFuaXB1bGF0aW9uIHNob3VsZCBhbHdheXMgYmUgZG9uZSBpbiBkaXJlY3RpdmUgbGluayBmdW5jdGlvbnMsIGFuZCAkYXBwbHkgc2hvdWxkIG5ldmVyIGJlIHVzZWQgaW4gYSBjb250cm9sbGVyISBTaW1wbGUgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYmUgaW4gdGhlIHZpZXcuXHJcbiAqL1xyXG5cclxuLyotLS0gU2FtcGxlIERpcmVjdGl2ZSB3aXRoIGEgJHdhdGNoIC0tLSovXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnc2FtcGxlRGlyZWN0aXZlJywgc2FtcGxlRGlyZWN0aXZlKTtcclxuXHJcblx0c2FtcGxlRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblxyXG5cdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZSgkdGltZW91dCkge1xyXG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHJlcGxhY2U6IHRydWUsXHJcblx0XHRcdHNjb3BlOiB7fSxcclxuXHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9zdWIvc2FtcGxlLnRwbC5odG1sJyxcclxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcclxuXHRcdFx0Y29udHJvbGxlcjogU2FtcGxlRGlyZWN0aXZlQ3RybCxcclxuXHRcdFx0Y29udHJvbGxlckFzOiAnc2QnLFxyXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB7XHJcblx0XHRcdFx0anNvbkRhdGE6ICc9J1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRsaW5rOiBzYW1wbGVEaXJlY3RpdmVMaW5rXHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogc2FtcGxlRGlyZWN0aXZlIExJTksgZnVuY3Rpb25cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gJHNjb3BlXHJcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcclxuXHRcdCAqIEBwYXJhbSBzZCB7Y29udHJvbGxlcn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2FtcGxlRGlyZWN0aXZlTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIHNkKSB7XHJcblx0XHRcdF9pbml0KCk7XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHRcdC8vIHdhdGNoIGZvciBhc3luYyBkYXRhIHRvIGJlY29tZSBhdmFpbGFibGUgYW5kIHVwZGF0ZVxyXG5cdFx0XHRcdCRzY29wZS4kd2F0Y2goJ3NkLmpzb25EYXRhJywgXyR3YXRjaEpzb25EYXRhKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqICR3YXRjaCBmb3Igc2QuanNvbkRhdGEgdG8gYmVjb21lIGF2YWlsYWJsZVxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsIHsqfVxyXG5cdFx0XHQgKiBAcGFyYW0gb2xkVmFsIHsqfVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaEpzb25EYXRhKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xyXG5cdFx0XHRcdFx0c2QuanNvbkRhdGEgPSBuZXdWYWw7XHJcblxyXG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdkZW1vbnN0cmF0ZSAkdGltZW91dCBpbmplY3Rpb24gaW4gYSBkaXJlY3RpdmUgbGluayBmdW5jdGlvbicpO1xyXG5cdFx0XHRcdFx0fSwgMTAwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRTYW1wbGVEaXJlY3RpdmVDdHJsLiRpbmplY3QgPSBbXTtcclxuXHQvKipcclxuXHQgKiBzYW1wbGVEaXJlY3RpdmUgQ09OVFJPTExFUlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFNhbXBsZURpcmVjdGl2ZUN0cmwoKSB7XHJcblx0XHR2YXIgc2QgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGNvbnRyb2xsZXIgbG9naWMgZ29lcyBoZXJlXHJcblx0fVxyXG5cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgSGVhZGVyQ3RybCk7XHJcblxyXG5cdEhlYWRlckN0cmwuJGluamVjdCA9IFsnJGxvY2F0aW9uJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlckN0cmwoJGxvY2F0aW9uLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBpbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gbmF2SXNBY3RpdmU7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIGFjdGl2YXRlIGNvbnRyb2xsZXJcclxuXHRcdFx0X2FjdGl2YXRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb250cm9sbGVyIGFjdGl2YXRlXHJcblx0XHQgKiBHZXQgSlNPTiBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMgeyp9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XHJcblx0XHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRoZWFkZXIuanNvbiA9IGRhdGE7XHJcblx0XHRcdHJldHVybiBoZWFkZXIuanNvbjtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGluZGV4IG5hdiBpZiBhY3RpdmVcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbmRleElzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXBwbHkgY2xhc3MgdG8gY3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG5hdklzQWN0aXZlKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2woJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IG5hdkNvbnRyb2xMaW5rXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIG5hdkNvbnRyb2wgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG5hdkNvbnRyb2xMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfbGF5b3V0Q2FudmFzID0gXyRib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cblx0XHRcdC8vIGRhdGEgbW9kZWxcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0X2luaXQoKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0XHQvLyBpbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdFx0dmFyIF9ycyA9IHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRcdHJlc2l6ZWRGbjogX3Jlc2l6ZWQsXG5cdFx0XHRcdFx0ZGVib3VuY2U6IDEwMFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIF8kbG9jYXRpb25DaGFuZ2VTdGFydCk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2l6ZWQgd2luZG93IChkZWJvdW5jZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKHtcblx0XHRcdFx0XHRtaW5IZWlnaHQ6ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3Blbk5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1vcGVuJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENsb3NlIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlTmF2KCkge1xuXHRcdFx0XHRfJGJvZHlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1vcGVuJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlTmF2KCkge1xuXHRcdFx0XHRpZiAoIV9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdoZW4gY2hhbmdpbmcgbG9jYXRpb24sIGNsb3NlIHRoZSBuYXYgaWYgaXQncyBvcGVuXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcblx0XHRcdFx0aWYgKF9uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBDbG9zZSBuYXYgYW5kIHNldCB1cCBtZW51IHRvZ2dsaW5nIGZ1bmN0aW9uYWxpdHlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUobXEpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSB0b2dnbGVOYXY7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0XHQgKiBEaXNhYmxlIG1lbnUgdG9nZ2xpbmcgYW5kIHJlbW92ZSBib2R5IGNsYXNzZXNcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZShtcSkge1xuXHRcdFx0XHQvLyB1bmJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gbnVsbDtcblxuXHRcdFx0XHRfJGJvZHkucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQgbmF2LW9wZW4nKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSgpKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=