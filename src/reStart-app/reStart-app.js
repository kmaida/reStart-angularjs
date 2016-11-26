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
		.factory('Metadata', Metadata);

	function Metadata() {
		var siteTitle = 'reStart-angular';
		var pageTitle = '';
		var keywords = '';
		var desc = '';

		// callable members
		return {
			set: set,
			getTitle: getTitle,
			getKeywords: getKeywords,
			getDesc: getDesc
		};

		/**
		 * Set page title, keywords, description
		 *
		 * @param newTitle {string}
		 * @param newKeywords {string}
		 * @param newDesc {string}
		 */
		function set(newTitle, newKeywords, newDesc) {
			pageTitle = ' | ' + newTitle;
			keywords = newKeywords;
			desc = newDesc;
		}

		/**
		 * Get title
		 * Returns site title and page title
		 *
		 * @returns {string} site title + page title
		 */
		function getTitle() {
			return siteTitle + pageTitle;
		}

		/**
		 * Get keywords
		 * Returns site meta keywords
		 *
		 * @returns keywords {string}
		 */
		function getKeywords() {
			return keywords;
		}

		/**
		 * Get description
		 * Returns site meta description
		 *
		 * @returns desc {string}
		 */
		function getDesc() {
			return desc;
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Metadata', '$scope', 'MQ', 'mediaCheck', '$log'];

	function PageCtrl(Metadata, $scope, MQ, mediaCheck, $log) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;
		// Set up functionality to run on enter/exit of media query
		var _mc = mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.LARGE,
				enter: _enterLarge,
				exit: _exitLarge
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
			page.metadata = Metadata;

			$scope.$on('$routeChangeStart', _routeChangeStart);
			$scope.$on('$routeChangeSuccess', _routeChangeSuccess);
			$scope.$on('$routeChangeError', _routeChangeError);
		}

		/**
		 * Enter large media query
		 * $broadcast 'enter-large' event
		 *
		 * @private
		 */
		function _enterLarge() {
			$scope.$broadcast('enter-large');
		}

		/**
		 * Exit large media query
		 * $broadcast 'exit-large' event
		 *
		 * @private
		 */
		function _exitLarge() {
			$scope.$broadcast('exit-large');
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
			if (angular.isObject(previous)) {
				_mc.matchCurrent(MQ.LARGE);
			}

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
						height: _winHeight
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
					height: '',
					overflowY: ''
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
		.directive('svgIcon', svgIcon);

	function svgIcon() {
		// return directive
		return {
			restrict: 'E',
			replace: true,
			scope: {
				name: '@'
			},
			template: '<svg class="icon {{::name}}"><use xlink:href="{{::xlinkHref}}" /></svg>',
			link: svgIconLink
		};

		function svgIconLink($scope, $attrs, $element) {
			$scope.xlinkHref = '/assets/images/svg/sprite.symbol.svg#' + $scope.name;
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

	Error404Ctrl.$inject = ['$scope', 'Metadata'];

	function Error404Ctrl($scope, Metadata) {
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
			Metadata.set(e404.title, 'error', 'Error 404 - page not found');

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

	HomeCtrl.$inject = ['$scope', 'Utils', 'MQ', 'mediaCheck', 'Metadata', 'JSONData'];

	function HomeCtrl($scope, Utils, MQ, mediaCheck, Metadata, JSONData) {
		// controllerAs ViewModel
		var home = this;

		// Set up functionality to run on enter/exit of media query
		var _mc = mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.LARGE,
				enter: _enterLarge,
				exit: _exitLarge
			},
			debounce: 200
		});

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
			Metadata.set(home.title, 'reStart-angular, angularjs, javascript, boilerplate, spa, demo, app, application', 'reStart-angular demo application');

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
		 * Enter large mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _enterLarge() {
			home.viewformat = 'large';
		}

		/**
		 * Exit large mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _exitLarge() {
			home.viewformat = 'small';
		}
	}
}());
(function() {
	'use strict';

	angular
		.module('reStart')
		.controller('SubCtrl', SubCtrl);

	SubCtrl.$inject = ['Utils', 'Metadata', 'resolveLocalData'];

	function SubCtrl(Utils, Metadata, resolveLocalData) {
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
			Metadata.set(sub.title, 'angularjs, subpage', 'reStart-angular sample subpage with directive and transclusion.');
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
		 * @param $element
		 */
		function navControlLink($scope, $element) {
			// private variables
			var _$layoutCanvas = $element;

			// data model
			$scope.nav = {};
			$scope.nav.navOpen;
			$scope.nav.toggleNav = toggleNav;

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
				$scope.$on('enter-large', _enterLarge);
				$scope.$on('exit-large', _exitLarge);
			}

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_$layoutCanvas.css({
					minHeight: $window.innerHeight + 'px'
				});
			}

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_$layoutCanvas
					.removeClass('nav-closed')
					.addClass('nav-open');

				$scope.navOpen = true;
			}

			/**
			 * Close mobile navigation
			 *
			 * @private
			 */
			function _closeNav() {
				_$layoutCanvas
					.removeClass('nav-open')
					.addClass('nav-closed');

				$scope.navOpen = false;
			}

			/**
			 * Toggle nav open/closed
			 */
			function toggleNav() {
				if (!$scope.navOpen) {
					_openNav();
				} else {
					_closeNav();
				}
			}

			/**
			 * When changing location, close the nav if it's open
			 */
			function _$locationChangeStart() {
				if ($scope.navOpen) {
					_closeNav();
				}
			}

			/**
			 * Function to execute when entering large media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _enterLarge(mq) {
				// unbind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = null;

				_$layoutCanvas.removeClass('nav-closed nav-open');
			}

			/**
			 * Function to execute when exiting large media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _exitLarge(mq) {
				_closeNav();

				// bind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = toggleNav;
			}
		}
	}

}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL01ldGFkYXRhLmZhY3RvcnkuanMiLCJjb3JlL1BhZ2UuY3RybC5qcyIsImNvcmUvVXRpbHMuZmFjdG9yeS5qcyIsImNvcmUvYXBwLXNldHVwL2FwcC5jb25maWcuanMiLCJjb3JlL2dldC1kYXRhL0pTT05EYXRhLmZhY3RvcnkuanMiLCJjb3JlL2dldC1kYXRhL1Jlcy5mYWN0b3J5LmpzIiwiY29yZS91aS9NUS5jb25zdGFudC5qcyIsImNvcmUvdWkvbG9hZGluZy5kaXIuanMiLCJjb3JlL3VpL3N2Z0ljb24uZGlyLmpzIiwiY29yZS91aS90cnVzdEFzSFRNTC5maWx0ZXIuanMiLCJwYWdlcy9lcnJvcjQwNC9FcnJvcjQwNC5jdHJsLmpzIiwicGFnZXMvaG9tZS9Ib21lLmN0cmwuanMiLCJwYWdlcy9zdWIvU3ViLmN0cmwuanMiLCJwYWdlcy9zdWIvc2FtcGxlLmRpci5qcyIsIm1vZHVsZXMvaGVhZGVyL0hlYWRlci5jdHJsLmpzIiwibW9kdWxlcy9oZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJyZVN0YXJ0LWFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcGxpY2F0aW9uIG1vZHVsZSBzZXR0ZXJcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICdtZWRpYUNoZWNrJywgJ3Jlc2l6ZSddKTtcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5mYWN0b3J5KCdNZXRhZGF0YScsIE1ldGFkYXRhKTtcblxuXHRmdW5jdGlvbiBNZXRhZGF0YSgpIHtcblx0XHR2YXIgc2l0ZVRpdGxlID0gJ3JlU3RhcnQtYW5ndWxhcic7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICcnO1xuXHRcdHZhciBrZXl3b3JkcyA9ICcnO1xuXHRcdHZhciBkZXNjID0gJyc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdHNldDogc2V0LFxuXHRcdFx0Z2V0VGl0bGU6IGdldFRpdGxlLFxuXHRcdFx0Z2V0S2V5d29yZHM6IGdldEtleXdvcmRzLFxuXHRcdFx0Z2V0RGVzYzogZ2V0RGVzY1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBTZXQgcGFnZSB0aXRsZSwga2V5d29yZHMsIGRlc2NyaXB0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VGl0bGUge3N0cmluZ31cblx0XHQgKiBAcGFyYW0gbmV3S2V5d29yZHMge3N0cmluZ31cblx0XHQgKiBAcGFyYW0gbmV3RGVzYyB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNldChuZXdUaXRsZSwgbmV3S2V5d29yZHMsIG5ld0Rlc2MpIHtcblx0XHRcdHBhZ2VUaXRsZSA9ICcgfCAnICsgbmV3VGl0bGU7XG5cdFx0XHRrZXl3b3JkcyA9IG5ld0tleXdvcmRzO1xuXHRcdFx0ZGVzYyA9IG5ld0Rlc2M7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHRpdGxlXG5cdFx0ICogUmV0dXJucyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSBzaXRlIHRpdGxlICsgcGFnZSB0aXRsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHNpdGVUaXRsZSArIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQga2V5d29yZHNcblx0XHQgKiBSZXR1cm5zIHNpdGUgbWV0YSBrZXl3b3Jkc1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMga2V5d29yZHMge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRLZXl3b3JkcygpIHtcblx0XHRcdHJldHVybiBrZXl3b3Jkcztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgZGVzY3JpcHRpb25cblx0XHQgKiBSZXR1cm5zIHNpdGUgbWV0YSBkZXNjcmlwdGlvblxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgZGVzYyB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldERlc2MoKSB7XG5cdFx0XHRyZXR1cm4gZGVzYztcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydNZXRhZGF0YScsICckc2NvcGUnLCAnTVEnLCAnbWVkaWFDaGVjaycsICckbG9nJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoTWV0YWRhdGEsICRzY29wZSwgTVEsIG1lZGlhQ2hlY2ssICRsb2cpIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHR2YXIgX21jID0gbWVkaWFDaGVjay5pbml0KHtcblx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRtZWRpYToge1xuXHRcdFx0XHRtcTogTVEuTEFSR0UsXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJMYXJnZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRMYXJnZVxuXHRcdFx0fSxcblx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHR9KTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UubWV0YWRhdGEgPSBNZXRhZGF0YTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBsYXJnZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2VudGVyLWxhcmdlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJMYXJnZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1sYXJnZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEV4aXQgbGFyZ2UgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LWxhcmdlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdExhcmdlKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2V4aXQtbGFyZ2UnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9uIGxvYWRpbmcgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPbigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9uJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVHVybiBvZmYgbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09mZigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdGFydCBoYW5kbGVyXG5cdFx0ICogSWYgbmV4dCByb3V0ZSBoYXMgcmVzb2x2ZSwgdHVybiBvbiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIG5leHQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3RhcnQoJGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5yZXNvbHZlKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYW5ndWxhci9uby1wcml2YXRlLWNhbGxcblx0XHRcdFx0X2xvYWRpbmdPbigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdWNjZXNzIGhhbmRsZXJcblx0XHQgKiBNYXRjaCBjdXJyZW50IG1lZGlhIHF1ZXJ5IGFuZCBydW4gYXBwcm9wcmlhdGUgZnVuY3Rpb25cblx0XHQgKiBJZiBjdXJyZW50IHJvdXRlIGhhcyBiZWVuIHJlc29sdmVkLCB0dXJuIG9mZiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cykge1xuXHRcdFx0aWYgKGFuZ3VsYXIuaXNPYmplY3QocHJldmlvdXMpKSB7XG5cdFx0XHRcdF9tYy5tYXRjaEN1cnJlbnQoTVEuTEFSR0UpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY3VycmVudC4kJHJvdXRlICYmIGN1cnJlbnQuJCRyb3V0ZS5yZXNvbHZlKSB7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBhbmd1bGFyL25vLXByaXZhdGUtY2FsbFxuXHRcdFx0XHRfbG9hZGluZ09mZigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBlcnJvciBoYW5kbGVyXG5cdFx0ICogSGFuZGxlIHJvdXRlIHJlc29sdmUgZmFpbHVyZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSByZWplY3Rpb24ge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZUVycm9yKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMsIHJlamVjdGlvbikge1xuXHRcdFx0dmFyIGRlc3RpbmF0aW9uID0gKGN1cnJlbnQgJiYgKGN1cnJlbnQudGl0bGUgfHwgY3VycmVudC5uYW1lIHx8IGN1cnJlbnQubG9hZGVkVGVtcGxhdGVVcmwpKSB8fCAndW5rbm93biB0YXJnZXQnO1xuXHRcdFx0dmFyIG1zZyA9ICdFcnJvciByb3V0aW5nIHRvICcgKyBkZXN0aW5hdGlvbiArICcuICcgKyAocmVqZWN0aW9uLm1zZyB8fCAnJyk7XG5cblx0XHRcdGlmIChfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XG5cdFx0XHRfbG9hZGluZ09mZigpO1xuXG5cdFx0XHQkbG9nLmVycm9yKG1zZyk7XG5cdFx0fVxuXHR9XG59KCkpOyIsIi8vIFwiZ2xvYmFsXCIgb2JqZWN0IHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlcnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZmFjdG9yeSgnVXRpbHMnLCBVdGlscyk7XG5cblx0ZnVuY3Rpb24gVXRpbHMoKSB7XG5cdFx0dmFyIGdyZWV0aW5nID0gJ0hlbGxvJztcblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z3JlZXRpbmc6IGdyZWV0aW5nLFxuXHRcdFx0YWxlcnRHcmVldGluZzogYWxlcnRHcmVldGluZ1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBBbGVydCBncmVldGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5hbWUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBhbGVydEdyZWV0aW5nKG5hbWUpIHtcblx0XHRcdGFsZXJ0KGdyZWV0aW5nICsgJywgJyArIG5hbWUgKyAnIScpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIvLyBhcHBsaWNhdGlvbiBjb25maWdcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnaG9tZSdcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3N1YnBhZ2UnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvc3ViL1N1Yi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnU3ViQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ3N1YicsXG5cdFx0XHRcdHJlc29sdmU6IHtcblx0XHRcdFx0XHRyZXNvbHZlTG9jYWxEYXRhOiByZXNvbHZlTG9jYWxEYXRhXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9wYWdlcy9lcnJvcjQwNC9FcnJvcjQwNC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnRXJyb3I0MDRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnZTQwNCdcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxuXG5cdHJlc29sdmVMb2NhbERhdGEuJGluamVjdCA9IFsnSlNPTkRhdGEnXTtcblx0LyoqXG5cdCAqIEdldCBsb2NhbCBkYXRhIGZvciByb3V0ZSByZXNvbHZlXG5cdCAqXG5cdCAqIEBwYXJhbSBKU09ORGF0YSB7ZmFjdG9yeX1cblx0ICogQHJldHVybnMge3Byb21pc2V9IGRhdGFcblx0ICovXG5cdGZ1bmN0aW9uIHJlc29sdmVMb2NhbERhdGEoSlNPTkRhdGEpIHtcblx0XHRyZXR1cm4gSlNPTkRhdGEuZ2V0TG9jYWxEYXRhKCk7XG5cdH1cbn0oKSk7IiwiLy8gZmV0Y2ggSlNPTiBkYXRhIHRvIHNoYXJlIGJldHdlZW4gY29udHJvbGxlcnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZmFjdG9yeSgnSlNPTkRhdGEnLCBKU09ORGF0YSk7XG5cblx0SlNPTkRhdGEuJGluamVjdCA9IFsnJGh0dHAnLCAnUmVzJ107XG5cblx0ZnVuY3Rpb24gSlNPTkRhdGEoJGh0dHAsIFJlcykge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TG9jYWxEYXRhOiBnZXRMb2NhbERhdGFcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR0VUIGxvY2FsIEpTT04gZGF0YSBmaWxlIGFuZCByZXR1cm4gcmVzdWx0c1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TG9jYWxEYXRhKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9kYXRhL2RhdGEuanNvbicpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblx0fVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmZhY3RvcnkoJ1JlcycsIFJlcyk7XG5cblx0ZnVuY3Rpb24gUmVzKCkge1xuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0c3VjY2Vzczogc3VjY2Vzcyxcblx0XHRcdGVycm9yOiBlcnJvclxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0XHQgKiBVc2VmdWwgZm9yIEFQSXMgKGllLCB3aXRoIG5naW54KSB3aGVyZSBzZXJ2ZXIgZXJyb3IgSFRNTCBwYWdlIG1heSBiZSByZXR1cm5lZCBpbiBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0XHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdGlmIChhbmd1bGFyLmlzT2JqZWN0KHJlc3BvbnNlLmRhdGEpKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uIC0gZXJyb3Jcblx0XHQgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCBlcnJvciBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige29iamVjdH1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBlcnJvcihlcnJvcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciByZXRyaWV2aW5nIGRhdGEnLCBlcnJvcik7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuXHR2YXIgTVEgPSB7XG5cdFx0U01BTEw6ICcobWF4LXdpZHRoOiA3NjdweCknLFxuXHRcdExBUkdFOiAnKG1pbi13aWR0aDogNzY4cHgpJ1xuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuY29uc3RhbnQoJ01RJywgTVEpO1xufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmRpcmVjdGl2ZSgnbG9hZGluZycsIGxvYWRpbmcpO1xuXG5cdGxvYWRpbmcuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBsb2FkaW5nKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdFx0dGVtcGxhdGVVcmw6ICdyZVN0YXJ0LWFwcC9jb3JlL3VpL2xvYWRpbmcudHBsLmh0bWwnLFxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcblx0XHRcdGNvbnRyb2xsZXI6IGxvYWRpbmdDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9hZGluZycsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogbG9hZGluZ0xpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbG9hZGluZyBMSU5LXG5cdFx0ICogRGlzYWJsZXMgcGFnZSBzY3JvbGxpbmcgd2hlbiBsb2FkaW5nIG92ZXJsYXkgaXMgb3BlblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKiBAcGFyYW0gbG9hZGluZyB7Y29udHJvbGxlcn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsb2FkaW5nTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIGxvYWRpbmcpIHtcblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vICR3YXRjaCBhY3RpdmUgc3RhdGVcblx0XHRcdFx0JHNjb3BlLiR3YXRjaCgnbG9hZGluZy5hY3RpdmUnLCBfJHdhdGNoQWN0aXZlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaW5kb3cgcmVzaXplZFxuXHRcdFx0ICogSWYgbG9hZGluZywgcmVhcHBseSBib2R5IGhlaWdodFxuXHRcdFx0ICogdG8gcHJldmVudCBzY3JvbGxiYXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRcdGlmIChsb2FkaW5nLmFjdGl2ZSkge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiAkd2F0Y2ggbG9hZGluZy5hY3RpdmVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gbmV3VmFsIHtib29sZWFufVxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbCB7dW5kZWZpbmVkfGJvb2xlYW59XG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJHdhdGNoQWN0aXZlKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcblx0XHRcdFx0XHRfb3BlbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBsb2FkaW5nXG5cdFx0XHQgKiBEaXNhYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuKCkge1xuXHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRoZWlnaHQ6IF93aW5IZWlnaHQsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBsb2FkaW5nXG5cdFx0XHQgKiBFbmFibGUgc2Nyb2xsXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2Nsb3NlKCkge1xuXHRcdFx0XHRfJGJvZHkuY3NzKHtcblx0XHRcdFx0XHRoZWlnaHQ6ICcnLFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cdC8qKlxuXHQgKiBsb2FkaW5nIENPTlRST0xMRVJcblx0ICogVXBkYXRlIHRoZSBsb2FkaW5nIHN0YXR1cyBiYXNlZFxuXHQgKiBvbiByb3V0ZUNoYW5nZSBzdGF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gbG9hZGluZ0N0cmwoJHNjb3BlKSB7XG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0Ly8gdHVybiBvbiBsb2FkaW5nIGZvciBpbml0aWFsIHBhZ2UgbG9hZFxuXHRcdFx0X2xvYWRpbmdBY3RpdmUoKTtcblxuXHRcdFx0JHNjb3BlLiRvbignbG9hZGluZy1vbicsIF9sb2FkaW5nQWN0aXZlKTtcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgX2xvYWRpbmdJbmFjdGl2ZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nQWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGluYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nSW5hY3RpdmUoKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZGlyZWN0aXZlKCdzdmdJY29uJywgc3ZnSWNvbik7XG5cblx0ZnVuY3Rpb24gc3ZnSWNvbigpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdFx0c2NvcGU6IHtcblx0XHRcdFx0bmFtZTogJ0AnXG5cdFx0XHR9LFxuXHRcdFx0dGVtcGxhdGU6ICc8c3ZnIGNsYXNzPVwiaWNvbiB7ezo6bmFtZX19XCI+PHVzZSB4bGluazpocmVmPVwie3s6OnhsaW5rSHJlZn19XCIgLz48L3N2Zz4nLFxuXHRcdFx0bGluazogc3ZnSWNvbkxpbmtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gc3ZnSWNvbkxpbmsoJHNjb3BlLCAkYXR0cnMsICRlbGVtZW50KSB7XG5cdFx0XHQkc2NvcGUueGxpbmtIcmVmID0gJy9hc3NldHMvaW1hZ2VzL3N2Zy9zcHJpdGUuc3ltYm9sLnN2ZyMnICsgJHNjb3BlLm5hbWU7XG5cdFx0fVxuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KCkpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0Jylcblx0XHQuY29udHJvbGxlcignRXJyb3I0MDRDdHJsJywgRXJyb3I0MDRDdHJsKTtcblxuXHRFcnJvcjQwNEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ01ldGFkYXRhJ107XG5cblx0ZnVuY3Rpb24gRXJyb3I0MDRDdHJsKCRzY29wZSwgTWV0YWRhdGEpIHtcblx0XHR2YXIgZTQwNCA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0ZTQwNC50aXRsZSA9ICc0MDQgLSBQYWdlIE5vdCBGb3VuZCc7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XG5cdFx0XHRNZXRhZGF0YS5zZXQoZTQwNC50aXRsZSwgJ2Vycm9yJywgJ0Vycm9yIDQwNCAtIHBhZ2Ugbm90IGZvdW5kJyk7XG5cblx0XHRcdC8vIG5vIGRhdGEgdG8gbG9hZCwgYnV0IGxvYWRpbmcgc3RhdGUgbWlnaHQgYmUgb25cblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cdH1cbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdVdGlscycsICdNUScsICdtZWRpYUNoZWNrJywgJ01ldGFkYXRhJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKCRzY29wZSwgVXRpbHMsIE1RLCBtZWRpYUNoZWNrLCBNZXRhZGF0YSwgSlNPTkRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxyXG5cdFx0dmFyIF9tYyA9IG1lZGlhQ2hlY2suaW5pdCh7XHJcblx0XHRcdHNjb3BlOiAkc2NvcGUsXHJcblx0XHRcdG1lZGlhOiB7XHJcblx0XHRcdFx0bXE6IE1RLkxBUkdFLFxyXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJMYXJnZSxcclxuXHRcdFx0XHRleGl0OiBfZXhpdExhcmdlXHJcblx0XHRcdH0sXHJcblx0XHRcdGRlYm91bmNlOiAyMDBcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhvbWUudGl0bGUgPSAnSG9tZSc7XHJcblx0XHRob21lLmdsb2JhbCA9IFV0aWxzO1xyXG5cdFx0aG9tZS5uYW1lID0gJ1Zpc2l0b3InO1xyXG5cdFx0aG9tZS5hbGVydEdyZWV0aW5nID0gVXRpbHMuYWxlcnRHcmVldGluZztcclxuXHRcdGhvbWUuc3RyaW5nT2ZIVE1MID0gJzxzdHJvbmcgc3R5bGU9XCJjb2xvcjogZ3JlZW47XCI+U29tZSBncmVlbiB0ZXh0PC9zdHJvbmc+IGJvdW5kIGFzIEhUTUwgd2l0aCBhIDxhIGhyZWY9XCIjXCI+bGluazwvYT4sIHRydXN0ZWQgd2l0aCBTQ0UhJztcclxuXHRcdGhvbWUudmlld2Zvcm1hdCA9IG51bGw7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFx0TWV0YWRhdGEuc2V0KGhvbWUudGl0bGUsICdyZVN0YXJ0LWFuZ3VsYXIsIGFuZ3VsYXJqcywgamF2YXNjcmlwdCwgYm9pbGVycGxhdGUsIHNwYSwgZGVtbywgYXBwLCBhcHBsaWNhdGlvbicsICdyZVN0YXJ0LWFuZ3VsYXIgZGVtbyBhcHBsaWNhdGlvbicpO1xyXG5cclxuXHRcdFx0Ly8gYWN0aXZhdGUgY29udHJvbGxlclxyXG5cdFx0XHRfYWN0aXZhdGUoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnRyb2xsZXIgYWN0aXZhdGVcclxuXHRcdCAqIEdldCBKU09OIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Kn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcclxuXHRcdFx0Ly8gc3RhcnQgbG9hZGluZ1xyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcclxuXHJcblx0XHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdFx0cmV0dXJuIEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWwgcHJvbWlzZSBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEge2pzb259XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZ2V0SnNvblN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLmpzb24gPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gc3RvcCBsb2FkaW5nXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcclxuXHJcblx0XHRcdHJldHVybiBob21lLmpzb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBsYXJnZSBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9lbnRlckxhcmdlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnbGFyZ2UnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRXhpdCBsYXJnZSBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9leGl0TGFyZ2UoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdzbWFsbCc7XHJcblx0XHR9XHJcblx0fVxyXG59KCkpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1N1YkN0cmwnLCBTdWJDdHJsKTtcclxuXHJcblx0U3ViQ3RybC4kaW5qZWN0ID0gWydVdGlscycsICdNZXRhZGF0YScsICdyZXNvbHZlTG9jYWxEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIFN1YkN0cmwoVXRpbHMsIE1ldGFkYXRhLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgc3ViID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRzdWIudGl0bGUgPSAnU3VicGFnZSc7XHJcblx0XHRzdWIuZ2xvYmFsID0gVXRpbHM7XHJcblx0XHRzdWIuanNvbiA9IHJlc29sdmVMb2NhbERhdGE7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFx0TWV0YWRhdGEuc2V0KHN1Yi50aXRsZSwgJ2FuZ3VsYXJqcywgc3VicGFnZScsICdyZVN0YXJ0LWFuZ3VsYXIgc2FtcGxlIHN1YnBhZ2Ugd2l0aCBkaXJlY3RpdmUgYW5kIHRyYW5zY2x1c2lvbi4nKTtcclxuXHRcdH1cclxuXHR9XHJcbn0oKSk7IiwiLyoqXHJcbiAqIERpcmVjdGl2ZXMgKGFuZCBhc3NvY2lhdGVkIGF0dHJpYnV0ZXMpIGFyZSBhbHdheXMgZGVjbGFyZWQgYXMgY2FtZWxDYXNlIGluIEpTIGFuZCBzbmFrZS1jYXNlIGluIEhUTUxcclxuICogQW5ndWxhcidzIGJ1aWx0LWluIDxhPiBkaXJlY3RpdmUgYXV0b21hdGljYWxseSBpbXBsZW1lbnRzIHByZXZlbnREZWZhdWx0IG9uIGxpbmtzIHRoYXQgZG9uJ3QgaGF2ZSBhbiBocmVmIGF0dHJpYnV0ZVxyXG4gKiBDb21wbGV4IEphdmFTY3JpcHQgRE9NIG1hbmlwdWxhdGlvbiBzaG91bGQgYWx3YXlzIGJlIGRvbmUgaW4gZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb25zLCBhbmQgJGFwcGx5IHNob3VsZCBuZXZlciBiZSB1c2VkIGluIGEgY29udHJvbGxlciEgU2ltcGxlIERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGJlIGluIHRoZSB2aWV3LlxyXG4gKi9cclxuXHJcbi8qLS0tIFNhbXBsZSBEaXJlY3RpdmUgd2l0aCBhICR3YXRjaCAtLS0qL1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0JylcclxuXHRcdC5kaXJlY3RpdmUoJ3NhbXBsZURpcmVjdGl2ZScsIHNhbXBsZURpcmVjdGl2ZSk7XHJcblxyXG5cdHNhbXBsZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckdGltZW91dCddO1xyXG5cclxuXHRmdW5jdGlvbiBzYW1wbGVEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxyXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxyXG5cdFx0XHRzY29wZToge30sXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAncmVTdGFydC1hcHAvcGFnZXMvc3ViL3NhbXBsZS50cGwuaHRtbCcsXHJcblx0XHRcdHRyYW5zY2x1ZGU6IHRydWUsXHJcblx0XHRcdGNvbnRyb2xsZXI6IFNhbXBsZURpcmVjdGl2ZUN0cmwsXHJcblx0XHRcdGNvbnRyb2xsZXJBczogJ3NkJyxcclxuXHRcdFx0YmluZFRvQ29udHJvbGxlcjoge1xyXG5cdFx0XHRcdGpzb25EYXRhOiAnPSdcclxuXHRcdFx0fSxcclxuXHRcdFx0bGluazogc2FtcGxlRGlyZWN0aXZlTGlua1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIHNhbXBsZURpcmVjdGl2ZSBMSU5LIGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICRzY29wZVxyXG5cdFx0ICogQHBhcmFtICRlbGVtZW50XHJcblx0XHQgKiBAcGFyYW0gJGF0dHJzXHJcblx0XHQgKiBAcGFyYW0gc2Qge2NvbnRyb2xsZXJ9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNhbXBsZURpcmVjdGl2ZUxpbmsoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCBzZCkge1xyXG5cdFx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwcml2YXRlXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0XHQvLyB3YXRjaCBmb3IgYXN5bmMgZGF0YSB0byBiZWNvbWUgYXZhaWxhYmxlIGFuZCB1cGRhdGVcclxuXHRcdFx0XHQkc2NvcGUuJHdhdGNoKCdzZC5qc29uRGF0YScsIF8kd2F0Y2hKc29uRGF0YSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiAkd2F0Y2ggZm9yIHNkLmpzb25EYXRhIHRvIGJlY29tZSBhdmFpbGFibGVcclxuXHRcdFx0ICpcclxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Kn1cclxuXHRcdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn1cclxuXHRcdFx0ICogQHByaXZhdGVcclxuXHRcdFx0ICovXHJcblx0XHRcdGZ1bmN0aW9uIF8kd2F0Y2hKc29uRGF0YShuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRcdGlmIChuZXdWYWwpIHtcclxuXHRcdFx0XHRcdHNkLmpzb25EYXRhID0gbmV3VmFsO1xyXG5cclxuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnZGVtb25zdHJhdGUgJHRpbWVvdXQgaW5qZWN0aW9uIGluIGEgZGlyZWN0aXZlIGxpbmsgZnVuY3Rpb24nKTtcclxuXHRcdFx0XHRcdH0sIDEwMDApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0U2FtcGxlRGlyZWN0aXZlQ3RybC4kaW5qZWN0ID0gW107XHJcblx0LyoqXHJcblx0ICogc2FtcGxlRGlyZWN0aXZlIENPTlRST0xMRVJcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBTYW1wbGVEaXJlY3RpdmVDdHJsKCkge1xyXG5cdFx0dmFyIHNkID0gdGhpcztcclxuXHJcblx0XHQvLyBjb250cm9sbGVyIGxvZ2ljIGdvZXMgaGVyZVxyXG5cdH1cclxuXHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIEhlYWRlckN0cmwpO1xyXG5cclxuXHRIZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRsb2NhdGlvbicsICdKU09ORGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBIZWFkZXJDdHJsKCRsb2NhdGlvbiwgSlNPTkRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gaW5kZXhJc0FjdGl2ZTtcclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IG5hdklzQWN0aXZlO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBhY3RpdmF0ZSBjb250cm9sbGVyXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udHJvbGxlciBhY3RpdmF0ZVxyXG5cdFx0ICogR2V0IEpTT04gZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHsqfVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xyXG5cdFx0XHQvLyBnZXQgdGhlIGRhdGEgZnJvbSBKU09OXHJcblx0XHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKS50aGVuKF9nZXRKc29uU3VjY2Vzcyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtqc29ufVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldEpzb25TdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aGVhZGVyLmpzb24gPSBkYXRhO1xyXG5cdFx0XHRyZXR1cm4gaGVhZGVyLmpzb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBcHBseSBjbGFzcyB0byBpbmRleCBuYXYgaWYgYWN0aXZlXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBuYXZJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpLnN1YnN0cigwLCBwYXRoLmxlbmd0aCkgPT09IHBhdGg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydCcpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBuYXZDb250cm9sKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBuYXZDb250cm9sIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUsICRlbGVtZW50KSB7XG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kbGF5b3V0Q2FudmFzID0gJGVsZW1lbnQ7XG5cblx0XHRcdC8vIGRhdGEgbW9kZWxcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblx0XHRcdCRzY29wZS5uYXYubmF2T3Blbjtcblx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMTAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KTtcblx0XHRcdFx0JHNjb3BlLiRvbignZW50ZXItbGFyZ2UnLCBfZW50ZXJMYXJnZSk7XG5cdFx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbGFyZ2UnLCBfZXhpdExhcmdlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfJGxheW91dENhbnZhcy5jc3Moe1xuXHRcdFx0XHRcdG1pbkhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCArICdweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xuXHRcdFx0XHRfJGxheW91dENhbnZhc1xuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdCRzY29wZS5uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRsYXlvdXRDYW52YXNcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1vcGVuJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25hdi1jbG9zZWQnKTtcblxuXHRcdFx0XHQkc2NvcGUubmF2T3BlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRvZ2dsZSBuYXYgb3Blbi9jbG9zZWRcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdG9nZ2xlTmF2KCkge1xuXHRcdFx0XHRpZiAoISRzY29wZS5uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X29wZW5OYXYoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFdoZW4gY2hhbmdpbmcgbG9jYXRpb24sIGNsb3NlIHRoZSBuYXYgaWYgaXQncyBvcGVuXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF8kbG9jYXRpb25DaGFuZ2VTdGFydCgpIHtcblx0XHRcdFx0aWYgKCRzY29wZS5uYXZPcGVuKSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZW50ZXJpbmcgbGFyZ2UgbWVkaWEgcXVlcnlcblx0XHRcdCAqIERpc2FibGUgbWVudSB0b2dnbGluZyBhbmQgcmVtb3ZlIGJvZHkgY2xhc3Nlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlckxhcmdlKG1xKSB7XG5cdFx0XHRcdC8vIHVuYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBudWxsO1xuXG5cdFx0XHRcdF8kbGF5b3V0Q2FudmFzLnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV4aXRpbmcgbGFyZ2UgbWVkaWEgcXVlcnlcblx0XHRcdCAqIENsb3NlIG5hdiBhbmQgc2V0IHVwIG1lbnUgdG9nZ2xpbmcgZnVuY3Rpb25hbGl0eVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0TGFyZ2UobXEpIHtcblx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cblx0XHRcdFx0Ly8gYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSB0b2dnbGVOYXY7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0oKSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
