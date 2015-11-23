angular
	.module('reStart', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck', 'resize']);
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('Error404Ctrl', Error404Ctrl);

	Error404Ctrl.$inject = ['Page'];

	function Error404Ctrl(Page) {
		var e404 = this;

		e404.title = '404 - Page Not Found';

		// set page <title>
		Page.setTitle(e404.title);
	}
})();
// "global" object to share between controllers
(function() {
	'use strict';

	angular
		.module('reStart')
		.factory('GlobalObj', GlobalObj);

	function GlobalObj() {
		var greeting = 'Hello';

		/**
		 * Alert greeting
		 *
		 * @param name {string}
		 */
		function alertGreeting(name) {
			alert(greeting + ', ' + name + '!');
		}

		// callable members
		return {
			greeting: greeting,
			alertGreeting: alertGreeting
		};
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
				.get('/reStart-app/data/data.json')
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

		// associate page <title>
		page.pageTitle = Page;

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

		$scope.$on('$routeChangeStart', _routeChangeStart);
		$scope.$on('$routeChangeSuccess', _routeChangeSuccess);
		$scope.$on('$routeChangeError', _routeChangeError);

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

		// callable members
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
		.module('reStart')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'reStart-app/home/Home.view.html',
				controller: 'HomeCtrl',
				controllerAs: 'home'
			})
			.when('/subpage', {
				templateUrl: 'reStart-app/sub/Sub.view.html',
				controller: 'SubCtrl',
				controllerAs: 'sub',
				resolve: {
					resolveLocalData: resolveLocalData
				}
			})
			.when('/404', {
				templateUrl: 'reStart-app/404/404.view.html',
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

		loadingLink.$inject = ['$scope', '$element', '$attrs', 'loading'];

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
			var _$body = angular.element('body');
			var _winHeight = $window.innerHeight + 'px';

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
			 * Initialize debounced resize
			 */
			var _rs = resize.init({
				scope: $scope,
				resizedFn: _resized,
				debounce: 200
			});

			/**
			 * $watch loading.active
			 *
			 * @param newVal {boolean}
			 * @param oldVal {undefined|boolean}
			 */
			function $watchActive(newVal, oldVal) {
				if (newVal) {
					_open();
				} else {
					_close();
				}
			}

			$scope.$watch('loading.active', $watchActive);

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
	}

	loadingCtrl.$inject = ['$scope'];
	/**
	 * loading CONTROLLER
	 * Update the loading status based
	 * on routeChange state
	 */
	function loadingCtrl($scope) {
		var loading = this;

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

		$scope.$on('loading-on', _loadingActive);
		$scope.$on('loading-off', _loadingInactive);
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

		// activate controller
		_activate();

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

		navControlLink.$inject = ['$scope'];

		function navControlLink($scope) {
			// data model
			$scope.nav = {};

			// private variables
			var _$body = angular.element('body');
			var _layoutCanvas = _$body.find('.layout-canvas');
			var _navOpen;

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
			 * Initialize debounced resize
			 */
			var _rs = resize.init({
				scope: $scope,
				resizedFn: _resized,
				debounce: 200
			});

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
			$scope.$on('$locationChangeStart', function() {
				if (_navOpen) {
					_closeNav();
				}
			});

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

			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);
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

		// set page <title>
		Page.setTitle(home.title);

		$scope.$on('enter-mobile', _enterMobile);
		$scope.$on('exit-mobile', _exitMobile);

		// activate controller
		_activate();

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

		// set page <title>
		Page.setTitle(sub.title);

		// data from route resolve
		sub.json = resolveLocalData;
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
						console.log('demonstrate $timeout injection in a directive link function');
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
			templateUrl: 'reStart-app/sub/sample.tpl.html',
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

		// controller logic goes here
	}

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCI0MDQvRXJyb3I0MDQuY3RybC5qcyIsImNvcmUvR2xvYmFsT2JqLmZhY3RvcnkuanMiLCJjb3JlL0pTT05EYXRhLmZhY3RvcnkuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvYXBwLmNvbmZpZy5qcyIsImNvcmUvbG9hZGluZy5kaXIuanMiLCJjb3JlL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsImhlYWRlci9IZWFkZXIuY3RybC5qcyIsImhlYWRlci9uYXZDb250cm9sLmRpci5qcyIsImhvbWUvSG9tZS5jdHJsLmpzIiwic3ViL1N1Yi5jdHJsLmpzIiwic3ViL3NhbXBsZS5kaXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicmVTdGFydC1hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyXG5cdC5tb2R1bGUoJ3JlU3RhcnQnLCBbJ25nUm91dGUnLCAnbmdSZXNvdXJjZScsICduZ1Nhbml0aXplJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJ10pOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuY29udHJvbGxlcignRXJyb3I0MDRDdHJsJywgRXJyb3I0MDRDdHJsKTtcblxuXHRFcnJvcjQwNEN0cmwuJGluamVjdCA9IFsnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIEVycm9yNDA0Q3RybChQYWdlKSB7XG5cdFx0dmFyIGU0MDQgPSB0aGlzO1xuXG5cdFx0ZTQwNC50aXRsZSA9ICc0MDQgLSBQYWdlIE5vdCBGb3VuZCc7XG5cblx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XG5cdFx0UGFnZS5zZXRUaXRsZShlNDA0LnRpdGxlKTtcblx0fVxufSkoKTsiLCIvLyBcImdsb2JhbFwiIG9iamVjdCB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmZhY3RvcnkoJ0dsb2JhbE9iaicsIEdsb2JhbE9iaik7XG5cblx0ZnVuY3Rpb24gR2xvYmFsT2JqKCkge1xuXHRcdHZhciBncmVldGluZyA9ICdIZWxsbyc7XG5cblx0XHQvKipcblx0XHQgKiBBbGVydCBncmVldGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5hbWUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBhbGVydEdyZWV0aW5nKG5hbWUpIHtcblx0XHRcdGFsZXJ0KGdyZWV0aW5nICsgJywgJyArIG5hbWUgKyAnIScpO1xuXHRcdH1cblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z3JlZXRpbmc6IGdyZWV0aW5nLFxuXHRcdFx0YWxlcnRHcmVldGluZzogYWxlcnRHcmVldGluZ1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gZmV0Y2ggSlNPTiBkYXRhIHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlcnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZmFjdG9yeSgnSlNPTkRhdGEnLCBKU09ORGF0YSk7XG5cblx0SlNPTkRhdGEuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuXHRmdW5jdGlvbiBKU09ORGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBzdWNjZXNzXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0XHQgKiBVc2VmdWwgZm9yIEFQSXMgKGllLCB3aXRoIG5naW54KSB3aGVyZSBzZXJ2ZXIgZXJyb3IgSFRNTCBwYWdlIG1heSBiZSByZXR1cm5lZCBpbiBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fEFycmF5fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3N1Y2Nlc3NSZXMocmVzcG9uc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2Vycm9yUmVzKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHRVQgbG9jYWwgSlNPTiBkYXRhIGZpbGUgYW5kIHJldHVybiByZXN1bHRzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRMb2NhbERhdGEoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL3JlU3RhcnQtYXBwL2RhdGEvZGF0YS5qc29uJylcblx0XHRcdFx0LnRoZW4oX3N1Y2Nlc3NSZXMsIF9lcnJvclJlcyk7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRMb2NhbERhdGE6IGdldExvY2FsRGF0YVxuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcblx0dmFyIE1RID0ge1xuXHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcblx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmNvbnN0YW50KCdNUScsIE1RKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSwgJHNjb3BlLCBNUSwgbWVkaWFDaGVjaykge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSBmYWxzZTtcblxuXHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cblx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxuXHRcdHZhciBtYyA9IG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bWVkaWE6IHtcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSxcblx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHR9KTtcblxuXHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX3JvdXRlQ2hhbmdlU3RhcnQpO1xuXHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBfcm91dGVDaGFuZ2VTdWNjZXNzKTtcblx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblxuXHRcdC8qKlxuXHRcdCAqIEVudGVyIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2VudGVyLW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2VudGVyLW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEV4aXQgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZXhpdC1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2V4aXQtbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVHVybiBvbiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT24oKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnbG9hZGluZy1vbicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb2ZmIGxvYWRpbmcgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPZmYoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3RhcnQgaGFuZGxlclxuXHRcdCAqIElmIG5leHQgcm91dGUgaGFzIHJlc29sdmUsIHR1cm4gb24gbG9hZGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBuZXh0IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZVN0YXJ0KCRldmVudCwgbmV4dCwgY3VycmVudCkge1xuXHRcdFx0aWYgKG5leHQuJCRyb3V0ZS5yZXNvbHZlKSB7XG5cdFx0XHRcdF9sb2FkaW5nT24oKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3VjY2VzcyBoYW5kbGVyXG5cdFx0ICogTWF0Y2ggY3VycmVudCBtZWRpYSBxdWVyeSBhbmQgcnVuIGFwcHJvcHJpYXRlIGZ1bmN0aW9uXG5cdFx0ICogSWYgY3VycmVudCByb3V0ZSBoYXMgYmVlbiByZXNvbHZlZCwgdHVybiBvZmYgbG9hZGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdWNjZXNzKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMpIHtcblx0XHRcdG1jLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XG5cblx0XHRcdGlmIChjdXJyZW50LiQkcm91dGUucmVzb2x2ZSkge1xuXHRcdFx0XHRfbG9hZGluZ09mZigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBlcnJvciBoYW5kbGVyXG5cdFx0ICogSGFuZGxlIHJvdXRlIHJlc29sdmUgZmFpbHVyZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSByZWplY3Rpb24ge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZUVycm9yKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMsIHJlamVjdGlvbikge1xuXHRcdFx0aWYgKF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gdHJ1ZTtcblx0XHRcdF9sb2FkaW5nT2ZmKCk7XG5cblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9uIHJvdXRpbmcgZXJyb3IsIHNob3cgYW4gZXJyb3IuXG5cdFx0XHQgKi9cblx0XHRcdGFsZXJ0KCdBbiBlcnJvciBvY2N1cnJlZC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5mYWN0b3J5KCdQYWdlJywgUGFnZSk7XG5cblx0ZnVuY3Rpb24gUGFnZSgpIHtcblx0XHR2YXIgc2l0ZVRpdGxlID0gJ3JlU3RhcnQgQW5ndWxhcic7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdIb21lJztcblxuXHRcdC8qKlxuXHRcdCAqIFRpdGxlIGZ1bmN0aW9uXG5cdFx0ICogU2V0cyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSBzaXRlIHRpdGxlICsgcGFnZSB0aXRsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHNpdGVUaXRsZSArICcgfCAnICsgcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VGl0bGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gY29uZmlnXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9zdWJwYWdlJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3N1Yi9TdWIudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1N1YkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdzdWInLFxuXHRcdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdFx0cmVzb2x2ZUxvY2FsRGF0YTogcmVzb2x2ZUxvY2FsRGF0YVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy80MDQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvNDA0LzQwNC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRXJyb3I0MDRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZTQwNCdcblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy80MDQnXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cblxuXHRyZXNvbHZlTG9jYWxEYXRhLiRpbmplY3QgPSBbJ0pTT05EYXRhJ107XG5cdC8qKlxuXHQgKiBHZXQgbG9jYWwgZGF0YSBmb3Igcm91dGUgcmVzb2x2ZVxuXHQgKlxuXHQgKiBAcGFyYW0gSlNPTkRhdGEge2ZhY3Rvcnl9XG5cdCAqIEByZXR1cm5zIHtwcm9taXNlfSBkYXRhXG5cdCAqL1xuXHRmdW5jdGlvbiByZXNvbHZlTG9jYWxEYXRhKEpTT05EYXRhKSB7XG5cdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZGlyZWN0aXZlKCdsb2FkaW5nJywgbG9hZGluZyk7XG5cblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XG5cblx0XHRsb2FkaW5nTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJ2xvYWRpbmcnXTtcblxuXHRcdC8qKlxuXHRcdCAqIGxvYWRpbmcgTElOS1xuXHRcdCAqIERpc2FibGVzIHBhZ2Ugc2Nyb2xsaW5nIHdoZW4gbG9hZGluZyBvdmVybGF5IGlzIG9wZW5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICogQHBhcmFtIGxvYWRpbmcge2NvbnRyb2xsZXJ9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbG9hZGluZ0xpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBsb2FkaW5nKSB7XG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdpbmRvdyByZXNpemVkXG5cdFx0XHQgKiBJZiBsb2FkaW5nLCByZWFwcGx5IGJvZHkgaGVpZ2h0XG5cdFx0XHQgKiB0byBwcmV2ZW50IHNjcm9sbGJhclxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfd2luSGVpZ2h0ID0gJHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cblx0XHRcdFx0aWYgKGxvYWRpbmcuYWN0aXZlKSB7XG5cdFx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXG5cdFx0XHRcdFx0XHRvdmVyZmxvd1k6ICdoaWRkZW4nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdCAqL1xuXHRcdFx0dmFyIF9ycyA9IHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0ZGVib3VuY2U6IDIwMFxuXHRcdFx0fSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogJHdhdGNoIGxvYWRpbmcuYWN0aXZlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Ym9vbGVhbn1cblx0XHRcdCAqIEBwYXJhbSBvbGRWYWwge3VuZGVmaW5lZHxib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiAkd2F0Y2hBY3RpdmUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdF9vcGVuKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0JHNjb3BlLiR3YXRjaCgnbG9hZGluZy5hY3RpdmUnLCAkd2F0Y2hBY3RpdmUpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbG9hZGluZ1xuXHRcdFx0ICogRGlzYWJsZSBzY3JvbGxcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3BlbigpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbG9hZGluZ1xuXHRcdFx0ICogRW5hYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZSgpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnYXV0bydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvY29yZS9sb2FkaW5nLnRwbC5odG1sJyxcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXG5cdFx0XHRjb250cm9sbGVyOiBsb2FkaW5nQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ2xvYWRpbmcnLFxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdGxpbms6IGxvYWRpbmdMaW5rXG5cdFx0fTtcblx0fVxuXG5cdGxvYWRpbmdDdHJsLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXHQvKipcblx0ICogbG9hZGluZyBDT05UUk9MTEVSXG5cdCAqIFVwZGF0ZSB0aGUgbG9hZGluZyBzdGF0dXMgYmFzZWRcblx0ICogb24gcm91dGVDaGFuZ2Ugc3RhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGxvYWRpbmdDdHJsKCRzY29wZSkge1xuXHRcdHZhciBsb2FkaW5nID0gdGhpcztcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0FjdGl2ZSgpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgbG9hZGluZyB0byBpbmFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0luYWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQkc2NvcGUuJG9uKCdsb2FkaW5nLW9uJywgX2xvYWRpbmdBY3RpdmUpO1xuXHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgX2xvYWRpbmdJbmFjdGl2ZSk7XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmZpbHRlcigndHJ1c3RBc0hUTUwnLCB0cnVzdEFzSFRNTCk7XG5cblx0dHJ1c3RBc0hUTUwuJGluamVjdCA9IFsnJHNjZSddO1xuXG5cdGZ1bmN0aW9uIHRydXN0QXNIVE1MKCRzY2UpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24odGV4dCkge1xuXHRcdFx0cmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dCk7XG5cdFx0fTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgSGVhZGVyQ3RybCk7XHJcblxyXG5cdEhlYWRlckN0cmwuJGluamVjdCA9IFsnJGxvY2F0aW9uJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlckN0cmwoJGxvY2F0aW9uLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBpbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gbmF2SXNBY3RpdmU7XHJcblxyXG5cdFx0Ly8gYWN0aXZhdGUgY29udHJvbGxlclxyXG5cdFx0X2FjdGl2YXRlKCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBcHBseSBjbGFzcyB0byBpbmRleCBuYXYgaWYgYWN0aXZlXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBuYXZJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpLnN1YnN0cigwLCBwYXRoLmxlbmd0aCkgPT09IHBhdGg7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb250cm9sbGVyIGFjdGl2YXRlXHJcblx0XHQgKiBHZXQgSlNPTiBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMgeyp9XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZGF0YVxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7anNvbn1cclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF9nZXRKc29uU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdFx0aGVhZGVyLmpzb24gPSBkYXRhO1xyXG5cdFx0XHRcdHJldHVybiBoZWFkZXIuanNvbjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gZ2V0IHRoZSBkYXRhIGZyb20gSlNPTlxyXG5cdFx0XHRyZXR1cm4gSlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCkudGhlbihfZ2V0SnNvblN1Y2Nlc3MpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbCgkd2luZG93LCByZXNpemUpIHtcblxuXHRcdG5hdkNvbnRyb2xMaW5rLiRpbmplY3QgPSBbJyRzY29wZSddO1xuXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBkYXRhIG1vZGVsXG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX2xheW91dENhbnZhcyA9IF8kYm9keS5maW5kKCcubGF5b3V0LWNhbnZhcycpO1xuXHRcdFx0dmFyIF9uYXZPcGVuO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFJlc2l6ZWQgd2luZG93IChkZWJvdW5jZWQpXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3Jlc2l6ZWQoKSB7XG5cdFx0XHRcdF9sYXlvdXRDYW52YXMuY3NzKHtcblx0XHRcdFx0XHRtaW5IZWlnaHQ6ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0ICovXG5cdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0XHR9KTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoX25hdk9wZW4pIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKG1xKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdC8vIGJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cblx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ0dsb2JhbE9iaicsICdQYWdlJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKCRzY29wZSwgR2xvYmFsT2JqLCBQYWdlLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhvbWUudGl0bGUgPSAnSG9tZSc7XHJcblx0XHRob21lLmdsb2JhbCA9IEdsb2JhbE9iajtcclxuXHRcdGhvbWUubmFtZSA9ICdWaXNpdG9yJztcclxuXHRcdGhvbWUuYWxlcnRHcmVldGluZyA9IEdsb2JhbE9iai5hbGVydEdyZWV0aW5nO1xyXG5cdFx0aG9tZS5zdHJpbmdPZkhUTUwgPSAnPHN0cm9uZyBzdHlsZT1cImNvbG9yOiBncmVlbjtcIj5Tb21lIGdyZWVuIHRleHQ8L3N0cm9uZz4gYm91bmQgYXMgSFRNTCB3aXRoIGEgPGEgaHJlZj1cIiNcIj5saW5rPC9hPiwgdHJ1c3RlZCB3aXRoIFNDRSEnO1xyXG5cdFx0aG9tZS52aWV3Zm9ybWF0ID0gbnVsbDtcclxuXHJcblx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XHJcblx0XHRQYWdlLnNldFRpdGxlKGhvbWUudGl0bGUpO1xyXG5cclxuXHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHJcblx0XHQvLyBhY3RpdmF0ZSBjb250cm9sbGVyXHJcblx0XHRfYWN0aXZhdGUoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnRyb2xsZXIgYWN0aXZhdGVcclxuXHRcdCAqIEdldCBKU09OIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Kn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSBkYXRhIHtqc29ufVxyXG5cdFx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0XHQgKi9cclxuXHRcdFx0ZnVuY3Rpb24gX2dldEpzb25TdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0XHRob21lLmpzb24gPSBkYXRhO1xyXG5cclxuXHRcdFx0XHQvLyBzdG9wIGxvYWRpbmdcclxuXHRcdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XHJcblxyXG5cdFx0XHRcdHJldHVybiBob21lLmpzb247XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHN0YXJ0IGxvYWRpbmdcclxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XHJcblxyXG5cdFx0XHQvLyBnZXQgdGhlIGRhdGEgZnJvbSBKU09OXHJcblx0XHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKS50aGVuKF9nZXRKc29uU3VjY2Vzcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEV4aXQgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignU3ViQ3RybCcsIFN1YkN0cmwpO1xyXG5cclxuXHRTdWJDdHJsLiRpbmplY3QgPSBbJ0dsb2JhbE9iaicsICdQYWdlJywgJ3Jlc29sdmVMb2NhbERhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gU3ViQ3RybChHbG9iYWxPYmosIFBhZ2UsIHJlc29sdmVMb2NhbERhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBzdWIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdHN1Yi50aXRsZSA9ICdTdWJwYWdlJztcclxuXHRcdHN1Yi5nbG9iYWwgPSBHbG9iYWxPYmo7XHJcblxyXG5cdFx0Ly8gc2V0IHBhZ2UgPHRpdGxlPlxyXG5cdFx0UGFnZS5zZXRUaXRsZShzdWIudGl0bGUpO1xyXG5cclxuXHRcdC8vIGRhdGEgZnJvbSByb3V0ZSByZXNvbHZlXHJcblx0XHRzdWIuanNvbiA9IHJlc29sdmVMb2NhbERhdGE7XHJcblx0fVxyXG5cclxufSkoKTsiLCIvKipcclxuICogRGlyZWN0aXZlcyAoYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlcykgYXJlIGFsd2F5cyBkZWNsYXJlZCBhcyBjYW1lbENhc2UgaW4gSlMgYW5kIHNuYWtlLWNhc2UgaW4gSFRNTFxyXG4gKiBBbmd1bGFyJ3MgYnVpbHQtaW4gPGE+IGRpcmVjdGl2ZSBhdXRvbWF0aWNhbGx5IGltcGxlbWVudHMgcHJldmVudERlZmF1bHQgb24gbGlua3MgdGhhdCBkb24ndCBoYXZlIGFuIGhyZWYgYXR0cmlidXRlXHJcbiAqIENvbXBsZXggSmF2YVNjcmlwdCBET00gbWFuaXB1bGF0aW9uIHNob3VsZCBhbHdheXMgYmUgZG9uZSBpbiBkaXJlY3RpdmUgbGluayBmdW5jdGlvbnMsIGFuZCAkYXBwbHkgc2hvdWxkIG5ldmVyIGJlIHVzZWQgaW4gYSBjb250cm9sbGVyISBTaW1wbGUgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYmUgaW4gdGhlIHZpZXcuXHJcbiAqL1xyXG5cclxuLyotLS0gU2FtcGxlIERpcmVjdGl2ZSB3aXRoIGEgJHdhdGNoIC0tLSovXHJcbihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmRpcmVjdGl2ZSgnc2FtcGxlRGlyZWN0aXZlJywgc2FtcGxlRGlyZWN0aXZlKTtcclxuXHJcblx0c2FtcGxlRGlyZWN0aXZlLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XHJcblx0LyoqXHJcblx0ICogc2FtcGxlRGlyZWN0aXZlIGRpcmVjdGl2ZVxyXG5cdCAqIFNhbXBsZSBkaXJlY3RpdmUgd2l0aCBpc29sYXRlIHNjb3BlLFxyXG5cdCAqIGNvbnRyb2xsZXIsIGxpbmssIHRyYW5zY2x1c2lvblxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge29iamVjdH0gZGlyZWN0aXZlXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gc2FtcGxlRGlyZWN0aXZlKCR0aW1lb3V0KSB7XHJcblxyXG5cdFx0c2FtcGxlRGlyZWN0aXZlTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJ3NkJ107XHJcblx0XHQvKipcclxuXHRcdCAqIHNhbXBsZURpcmVjdGl2ZSBMSU5LIGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRzY29wZVxyXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XHJcblx0XHQgKiBAcGFyYW0gJGF0dHJzXHJcblx0XHQgKiBAcGFyYW0gc2Qge2NvbnRyb2xsZXJ9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZUxpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBzZCkge1xyXG5cdFx0XHQvLyB3YXRjaCBmb3IgYXN5bmMgZGF0YSB0byBiZWNvbWUgYXZhaWxhYmxlIGFuZCB1cGRhdGVcclxuXHRcdFx0JHNjb3BlLiR3YXRjaCgnc2QuanNvbkRhdGEnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcclxuXHRcdFx0XHRcdHNkLmpzb25EYXRhID0gbmV3VmFsO1xyXG5cclxuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnZGVtb25zdHJhdGUgJHRpbWVvdXQgaW5qZWN0aW9uIGluIGEgZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb24nKTtcclxuXHRcdFx0XHRcdH0sIDEwMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXHJcblx0XHRcdHJlcGxhY2U6IHRydWUsXHJcblx0XHRcdHNjb3BlOiB7XHJcblx0XHRcdFx0anNvbkRhdGE6ICc9J1xyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ3JlU3RhcnQtYXBwL3N1Yi9zYW1wbGUudHBsLmh0bWwnLFxyXG5cdFx0XHR0cmFuc2NsdWRlOiB0cnVlLFxyXG5cdFx0XHRjb250cm9sbGVyOiBTYW1wbGVEaXJlY3RpdmVDdHJsLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6ICdzZCcsXHJcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcblx0XHRcdGxpbms6IHNhbXBsZURpcmVjdGl2ZUxpbmtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRTYW1wbGVEaXJlY3RpdmVDdHJsLiRpbmplY3QgPSBbXTtcclxuXHQvKipcclxuXHQgKiBzYW1wbGVEaXJlY3RpdmUgQ09OVFJPTExFUlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFNhbXBsZURpcmVjdGl2ZUN0cmwoKSB7XHJcblx0XHR2YXIgc2QgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGNvbnRyb2xsZXIgbG9naWMgZ29lcyBoZXJlXHJcblx0fVxyXG5cclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=