angular
	.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck', 'resize']);
(function() {
	'use strict';

	angular
		.module('myApp')
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
		.module('myApp')
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
		.module('myApp')
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

	PageCtrl.$inject = ['Page', '$scope', '$rootScope', 'MQ', 'mediaCheck'];

	function PageCtrl(Page, $scope, $rootScope, MQ, mediaCheck) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;

		// associate page <title>
		page.pageTitle = Page;

		/**
		 * Enter mobile media query
		 * $broadcast 'enter-mobile' event
		 *
		 * @private
		 */
		function _enterMobile() {
			$rootScope.$broadcast('enter-mobile');
		}

		/**
		 * Exit mobile media query
		 * $broadcast 'exit-mobile' event
		 *
		 * @private
		 */
		function _exitMobile() {
			$rootScope.$broadcast('exit-mobile');
		}

		// Set up functionality to run on enter/exit of media query
		mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			},
			debounce: 200
		});

		/**
		 * Match current media query and run appropriate function
		 *
		 * @param $event {event}
		 * @param current {object}
		 * @param previous {object}
		 * @private
		 */
		function _routeChangeSuccess($event, current, previous) {
			mediaCheck.matchCurrent(MQ.SMALL);
		}

		$rootScope.$on('$routeChangeSuccess', _routeChangeSuccess);

		/**
		 * Route change error handler
		 * Handle route resolve failures
		 *
		 * @param $event {event}
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

			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			console.log(msg);

			/**
			 * On routing error, show an error.
			 */
			alert('An error occurred. Please try again.');
		}

		$rootScope.$on('$routeChangeError', _routeChangeError);
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
			.when('/404', {
				templateUrl: 'ng-app/404/404.view.html',
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
		.module('myApp')
		.directive('routeLoading', routeLoading);

	routeLoading.$inject = ['$window', 'resize'];

	function routeLoading($window, resize) {

		routeLoadingLink.$inject = ['$scope', '$element', '$attrs', 'loading'];

		/**
		 * routeLoading LINK
		 * Disables page scrolling when loading overlay is open
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param loading {controller}
		 */
		function routeLoadingLink($scope, $element, $attrs, loading) {
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
			resize.init({
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
					_$body.css({
						height: _winHeight,
						overflowY: 'hidden'
					});
				} else {
					_$body.css({
						height: 'auto',
						overflowY: 'auto'
					});
				}
			}

			$scope.$watch('loading.active', $watchActive);
		}

		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'ng-app/core/routeLoading.tpl.html',
			transclude: true,
			controller: routeLoadingCtrl,
			controllerAs: 'loading',
			bindToController: true,
			link: routeLoadingLink
		};
	}

	routeLoadingCtrl.$inject = ['$scope'];
	/**
	 * routeLoading CONTROLLER
	 * Update the loading status based
	 * on routeChange state
	 */
	function routeLoadingCtrl($scope) {
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

		// loading active on init
		_loadingActive();

		$scope.$on('$routeChangeStart', _loadingActive);
		$scope.$on('$routeChangeSuccess', _loadingInactive);
		$scope.$on('$routeChangeError', _loadingInactive);
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
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HeaderCtrl', HeaderCtrl);

	HeaderCtrl.$inject = ['$location', 'JSONData'];

	function HeaderCtrl($location, JSONData) {
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
			resize.init({
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
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'GlobalObj', 'Page', 'resolveLocalData'];

	function HomeCtrl($scope, GlobalObj, Page, resolveLocalData) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.title = 'Home';
		home.global = GlobalObj;
		home.name = 'Visitor';
		home.alertGreeting = GlobalObj.alertGreeting;
		home.stringOfHTML = '<strong style="color: green;">Some green text</strong> bound as HTML with a <a href="#">link</a>, trusted with SCE!';

		// set page <title>
		Page.setTitle(home.title);

		// data from route resolve
		home.json = resolveLocalData;

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

		$scope.$on('enter-mobile', _enterMobile);
		$scope.$on('exit-mobile', _exitMobile);
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
		sub.title = 'Subpage';
		sub.global = GlobalObj;

		// set page <title>
		Page.setTitle(sub.title);

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

		// controller logic goes here
	}

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCI0MDQvRXJyb3I0MDQuY3RybC5qcyIsImNvcmUvR2xvYmFsT2JqLmZhY3RvcnkuanMiLCJjb3JlL0pTT05EYXRhLmZhY3RvcnkuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvYXBwLmNvbmZpZy5qcyIsImNvcmUvcm91dGVMb2FkaW5nLmRpci5qcyIsImNvcmUvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiaGVhZGVyL0hlYWRlci5jdHJsLmpzIiwiaGVhZGVyL05hdkNvbnRyb2wuZGlyLmpzIiwiaG9tZS9Ib21lLmN0cmwuanMiLCJzdWIvU3ViLmN0cmwuanMiLCJzdWIvc2FtcGxlLmRpci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhclxuXHQubW9kdWxlKCdteUFwcCcsIFsnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nU2FuaXRpemUnLCAnbWVkaWFDaGVjaycsICdyZXNpemUnXSk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29udHJvbGxlcignRXJyb3I0MDRDdHJsJywgRXJyb3I0MDRDdHJsKTtcblxuXHRFcnJvcjQwNEN0cmwuJGluamVjdCA9IFsnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIEVycm9yNDA0Q3RybChQYWdlKSB7XG5cdFx0dmFyIGU0MDQgPSB0aGlzO1xuXG5cdFx0ZTQwNC50aXRsZSA9ICc0MDQgLSBQYWdlIE5vdCBGb3VuZCc7XG5cblx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XG5cdFx0UGFnZS5zZXRUaXRsZShlNDA0LnRpdGxlKTtcblx0fVxufSkoKTsiLCIvLyBcImdsb2JhbFwiIG9iamVjdCB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCdHbG9iYWxPYmonLCBHbG9iYWxPYmopO1xuXG5cdGZ1bmN0aW9uIEdsb2JhbE9iaigpIHtcblx0XHR2YXIgZ3JlZXRpbmcgPSAnSGVsbG8nO1xuXG5cdFx0LyoqXG5cdFx0ICogQWxlcnQgZ3JlZXRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuYW1lIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gYWxlcnRHcmVldGluZyhuYW1lKSB7XG5cdFx0XHRhbGVydChncmVldGluZyArICcsICcgKyBuYW1lICsgJyEnKTtcblx0XHR9XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdyZWV0aW5nOiBncmVldGluZyxcblx0XHRcdGFsZXJ0R3JlZXRpbmc6IGFsZXJ0R3JlZXRpbmdcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIGZldGNoIEpTT04gZGF0YSB0byBzaGFyZSBiZXR3ZWVuIGNvbnRyb2xsZXJzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCdKU09ORGF0YScsIEpTT05EYXRhKTtcblxuXHRKU09ORGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIEpTT05EYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIHN1Y2Nlc3Ncblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHtvYmplY3R8QXJyYXl9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc3VjY2Vzc1JlcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignUmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXG5cdFx0ICogVGhyb3dzIGFuIGVycm9yIHdpdGggZXJyb3IgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXJyb3JSZXMoZXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdFVCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExvY2FsRGF0YSgpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvbmctYXBwL2RhdGEvZGF0YS5qc29uJylcblx0XHRcdFx0LnRoZW4oX3N1Y2Nlc3NSZXMsIF9lcnJvclJlcyk7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRMb2NhbERhdGE6IGdldExvY2FsRGF0YVxuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcblx0dmFyIE1RID0ge1xuXHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcblx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb25zdGFudCgnTVEnLCBNUSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbnRyb2xsZXIoJ1BhZ2VDdHJsJywgUGFnZUN0cmwpO1xuXG5cdFBhZ2VDdHJsLiRpbmplY3QgPSBbJ1BhZ2UnLCAnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnTVEnLCAnbWVkaWFDaGVjayddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKFBhZ2UsICRzY29wZSwgJHJvb3RTY29wZSwgTVEsIG1lZGlhQ2hlY2spIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XG5cblx0XHQvLyBhc3NvY2lhdGUgcGFnZSA8dGl0bGU+XG5cdFx0cGFnZS5wYWdlVGl0bGUgPSBQYWdlO1xuXG5cdFx0LyoqXG5cdFx0ICogRW50ZXIgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZW50ZXItbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHQkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2VudGVyLW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEV4aXQgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZXhpdC1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xuXHRcdFx0JHJvb3RTY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8vIFNldCB1cCBmdW5jdGlvbmFsaXR5IHRvIHJ1biBvbiBlbnRlci9leGl0IG9mIG1lZGlhIHF1ZXJ5XG5cdFx0bWVkaWFDaGVjay5pbml0KHtcblx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRtZWRpYToge1xuXHRcdFx0XHRtcTogTVEuU01BTEwsXG5cdFx0XHRcdGVudGVyOiBfZW50ZXJNb2JpbGUsXG5cdFx0XHRcdGV4aXQ6IF9leGl0TW9iaWxlXG5cdFx0XHR9LFxuXHRcdFx0ZGVib3VuY2U6IDIwMFxuXHRcdH0pO1xuXG5cdFx0LyoqXG5cdFx0ICogTWF0Y2ggY3VycmVudCBtZWRpYSBxdWVyeSBhbmQgcnVuIGFwcHJvcHJpYXRlIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtldmVudH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRtZWRpYUNoZWNrLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XG5cdFx0fVxuXG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBfcm91dGVDaGFuZ2VTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBlcnJvciBoYW5kbGVyXG5cdFx0ICogSGFuZGxlIHJvdXRlIHJlc29sdmUgZmFpbHVyZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge2V2ZW50fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHJlamVjdGlvbiB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlRXJyb3IoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cywgcmVqZWN0aW9uKSB7XG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XG5cdFx0XHR2YXIgbXNnID0gJ0Vycm9yIHJvdXRpbmcgdG8gJyArIGRlc3RpbmF0aW9uICsgJy4gJyArIChyZWplY3Rpb24ubXNnIHx8ICcnKTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiByb3V0aW5nIGVycm9yLCBzaG93IGFuIGVycm9yLlxuXHRcdFx0ICovXG5cdFx0XHRhbGVydCgnQW4gZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0fVxuXG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZUVycm9yJywgX3JvdXRlQ2hhbmdlRXJyb3IpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdHZhciBwYWdlVGl0bGUgPSAnSG9tZSc7XG5cblx0XHRmdW5jdGlvbiB0aXRsZSgpIHtcblx0XHRcdHJldHVybiBwYWdlVGl0bGU7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gY29uZmlnXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnaG9tZScsXG5cdFx0XHRcdHJlc29sdmU6IHtcblx0XHRcdFx0XHRyZXNvbHZlTG9jYWxEYXRhOiByZXNvbHZlTG9jYWxEYXRhXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQud2hlbignL3N1YnBhZ2UnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3N1Yi9TdWIudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ1N1YkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdzdWInLFxuXHRcdFx0XHRyZXNvbHZlOiB7XG5cdFx0XHRcdFx0cmVzb2x2ZUxvY2FsRGF0YTogcmVzb2x2ZUxvY2FsRGF0YVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy80MDQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwLzQwNC80MDQudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0Vycm9yNDA0Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2U0MDQnXG5cdFx0XHR9KVxuXHRcdFx0Lm90aGVyd2lzZSh7XG5cdFx0XHRcdHJlZGlyZWN0VG86ICcvNDA0J1xuXHRcdFx0fSk7XG5cblx0XHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdFx0Lmh0bWw1TW9kZSh7XG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xuXHR9XG5cblx0cmVzb2x2ZUxvY2FsRGF0YS4kaW5qZWN0ID0gWydKU09ORGF0YSddO1xuXHQvKipcblx0ICogR2V0IGxvY2FsIGRhdGEgZm9yIHJvdXRlIHJlc29sdmVcblx0ICpcblx0ICogQHBhcmFtIEpTT05EYXRhIHtmYWN0b3J5fVxuXHQgKiBAcmV0dXJucyB7cHJvbWlzZX0gZGF0YVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVzb2x2ZUxvY2FsRGF0YShKU09ORGF0YSkge1xuXHRcdHJldHVybiBKU09ORGF0YS5nZXRMb2NhbERhdGEoKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5kaXJlY3RpdmUoJ3JvdXRlTG9hZGluZycsIHJvdXRlTG9hZGluZyk7XG5cblx0cm91dGVMb2FkaW5nLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XG5cblx0ZnVuY3Rpb24gcm91dGVMb2FkaW5nKCR3aW5kb3csIHJlc2l6ZSkge1xuXG5cdFx0cm91dGVMb2FkaW5nTGluay4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJ2xvYWRpbmcnXTtcblxuXHRcdC8qKlxuXHRcdCAqIHJvdXRlTG9hZGluZyBMSU5LXG5cdFx0ICogRGlzYWJsZXMgcGFnZSBzY3JvbGxpbmcgd2hlbiBsb2FkaW5nIG92ZXJsYXkgaXMgb3BlblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKiBAcGFyYW0gbG9hZGluZyB7Y29udHJvbGxlcn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiByb3V0ZUxvYWRpbmdMaW5rKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgbG9hZGluZykge1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF93aW5IZWlnaHQgPSAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaW5kb3cgcmVzaXplZFxuXHRcdFx0ICogSWYgbG9hZGluZywgcmVhcHBseSBib2R5IGhlaWdodFxuXHRcdFx0ICogdG8gcHJldmVudCBzY3JvbGxiYXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRcdGlmIChsb2FkaW5nLmFjdGl2ZSkge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSW5pdGlhbGl6ZSBkZWJvdW5jZWQgcmVzaXplXG5cdFx0XHQgKi9cblx0XHRcdHJlc2l6ZS5pbml0KHtcblx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0ZGVib3VuY2U6IDIwMFxuXHRcdFx0fSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogJHdhdGNoIGxvYWRpbmcuYWN0aXZlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Ym9vbGVhbn1cblx0XHRcdCAqIEBwYXJhbSBvbGRWYWwge3VuZGVmaW5lZHxib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiAkd2F0Y2hBY3RpdmUobmV3VmFsLCBvbGRWYWwpIHtcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0XHRvdmVyZmxvd1k6ICdhdXRvJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCRzY29wZS4kd2F0Y2goJ2xvYWRpbmcuYWN0aXZlJywgJHdhdGNoQWN0aXZlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvY29yZS9yb3V0ZUxvYWRpbmcudHBsLmh0bWwnLFxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcblx0XHRcdGNvbnRyb2xsZXI6IHJvdXRlTG9hZGluZ0N0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICdsb2FkaW5nJyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHRsaW5rOiByb3V0ZUxvYWRpbmdMaW5rXG5cdFx0fTtcblx0fVxuXG5cdHJvdXRlTG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cdC8qKlxuXHQgKiByb3V0ZUxvYWRpbmcgQ09OVFJPTExFUlxuXHQgKiBVcGRhdGUgdGhlIGxvYWRpbmcgc3RhdHVzIGJhc2VkXG5cdCAqIG9uIHJvdXRlQ2hhbmdlIHN0YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiByb3V0ZUxvYWRpbmdDdHJsKCRzY29wZSkge1xuXHRcdHZhciBsb2FkaW5nID0gdGhpcztcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0FjdGl2ZSgpIHtcblx0XHRcdGxvYWRpbmcuYWN0aXZlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgbG9hZGluZyB0byBpbmFjdGl2ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ0luYWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBsb2FkaW5nIGFjdGl2ZSBvbiBpbml0XG5cdFx0X2xvYWRpbmdBY3RpdmUoKTtcblxuXHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX2xvYWRpbmdBY3RpdmUpO1xuXHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBfbG9hZGluZ0luYWN0aXZlKTtcblx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9sb2FkaW5nSW5hY3RpdmUpO1xuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZmlsdGVyKCd0cnVzdEFzSFRNTCcsIHRydXN0QXNIVE1MKTtcblxuXHR0cnVzdEFzSFRNTC4kaW5qZWN0ID0gWyckc2NlJ107XG5cblx0ZnVuY3Rpb24gdHJ1c3RBc0hUTUwoJHNjZSkge1xuXHRcdHJldHVybiBmdW5jdGlvbih0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ215QXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgSGVhZGVyQ3RybCk7XHJcblxyXG5cdEhlYWRlckN0cmwuJGluamVjdCA9IFsnJGxvY2F0aW9uJywgJ0pTT05EYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhlYWRlckN0cmwoJGxvY2F0aW9uLCBKU09ORGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aGVhZGVyLmluZGV4SXNBY3RpdmUgPSBpbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gbmF2SXNBY3RpdmU7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdWNjZXNzZnVsIHByb21pc2UgZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIHtqc29ufVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2dldEpzb25TdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aGVhZGVyLmpzb24gPSBkYXRhO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGdldCB0aGUgZGF0YSBmcm9tIEpTT05cclxuXHRcdEpTT05EYXRhLmdldExvY2FsRGF0YSgpLnRoZW4oX2dldEpzb25TdWNjZXNzKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGluZGV4IG5hdiBpZiBhY3RpdmVcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG4gXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFwcGx5IGNsYXNzIHRvIGN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICovXHJcblx0XHQgZnVuY3Rpb24gbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZGlyZWN0aXZlKCduYXZDb250cm9sJywgbmF2Q29udHJvbCk7XG5cblx0bmF2Q29udHJvbC4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIG5hdkNvbnRyb2woJHdpbmRvdywgcmVzaXplKSB7XG5cblx0XHRuYXZDb250cm9sTGluay4kaW5qZWN0ID0gWyckc2NvcGUnXTtcblxuXHRcdGZ1bmN0aW9uIG5hdkNvbnRyb2xMaW5rKCRzY29wZSkge1xuXHRcdFx0Ly8gZGF0YSBtb2RlbFxuXHRcdFx0JHNjb3BlLm5hdiA9IHt9O1xuXG5cdFx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdFx0dmFyIF8kYm9keSA9IGFuZ3VsYXIuZWxlbWVudCgnYm9keScpO1xuXHRcdFx0dmFyIF9sYXlvdXRDYW52YXMgPSBfJGJvZHkuZmluZCgnLmxheW91dC1jYW52YXMnKTtcblx0XHRcdHZhciBfbmF2T3BlbjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfbGF5b3V0Q2FudmFzLmNzcyh7XG5cdFx0XHRcdFx0bWluSGVpZ2h0OiAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4J1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbml0aWFsaXplIGRlYm91bmNlZCByZXNpemVcblx0XHRcdCAqL1xuXHRcdFx0cmVzaXplLmluaXQoe1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0XHR9KTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxuXHRcdFx0ICovXG5cdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoX25hdk9wZW4pIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKG1xKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdC8vIGJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cblx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdHbG9iYWxPYmonLCAnUGFnZScsICdyZXNvbHZlTG9jYWxEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKCRzY29wZSwgR2xvYmFsT2JqLCBQYWdlLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aG9tZS50aXRsZSA9ICdIb21lJztcclxuXHRcdGhvbWUuZ2xvYmFsID0gR2xvYmFsT2JqO1xyXG5cdFx0aG9tZS5uYW1lID0gJ1Zpc2l0b3InO1xyXG5cdFx0aG9tZS5hbGVydEdyZWV0aW5nID0gR2xvYmFsT2JqLmFsZXJ0R3JlZXRpbmc7XHJcblx0XHRob21lLnN0cmluZ09mSFRNTCA9ICc8c3Ryb25nIHN0eWxlPVwiY29sb3I6IGdyZWVuO1wiPlNvbWUgZ3JlZW4gdGV4dDwvc3Ryb25nPiBib3VuZCBhcyBIVE1MIHdpdGggYSA8YSBocmVmPVwiI1wiPmxpbms8L2E+LCB0cnVzdGVkIHdpdGggU0NFISc7XHJcblxyXG5cdFx0Ly8gc2V0IHBhZ2UgPHRpdGxlPlxyXG5cdFx0UGFnZS5zZXRUaXRsZShob21lLnRpdGxlKTtcclxuXHJcblx0XHQvLyBkYXRhIGZyb20gcm91dGUgcmVzb2x2ZVxyXG5cdFx0aG9tZS5qc29uID0gcmVzb2x2ZUxvY2FsRGF0YTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEVudGVyIHNtYWxsIG1xXHJcblx0XHQgKiBTZXQgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnc21hbGwnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRXhpdCBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnbGFyZ2UnO1xyXG5cdFx0fVxyXG5cclxuXHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1N1YkN0cmwnLCBTdWJDdHJsKTtcclxuXHJcblx0U3ViQ3RybC4kaW5qZWN0ID0gWydHbG9iYWxPYmonLCAnUGFnZScsICdyZXNvbHZlTG9jYWxEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIFN1YkN0cmwoR2xvYmFsT2JqLCBQYWdlLCByZXNvbHZlTG9jYWxEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgc3ViID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRzdWIudGl0bGUgPSAnU3VicGFnZSc7XHJcblx0XHRzdWIuZ2xvYmFsID0gR2xvYmFsT2JqO1xyXG5cclxuXHRcdC8vIHNldCBwYWdlIDx0aXRsZT5cclxuXHRcdFBhZ2Uuc2V0VGl0bGUoc3ViLnRpdGxlKTtcclxuXHJcblx0XHQvLyBkYXRhIGZyb20gcm91dGUgcmVzb2x2ZVxyXG5cdFx0c3ViLmpzb24gPSByZXNvbHZlTG9jYWxEYXRhO1xyXG5cdH1cclxuXHJcbn0pKCk7IiwiLy8gRGlyZWN0aXZlcyAoYW5kIGFzc29jaWF0ZWQgYXR0cmlidXRlcykgYXJlIGNhbWVsQ2FzZSBpbiBKUyBhbmQgc25ha2UtY2FzZSBpbiBIVE1MXHJcbi8vIEFuZ3VsYXIncyBidWlsdC1pbiA8YT4gZGlyZWN0aXZlIGF1dG9tYXRpY2FsbHkgaW1wbGVtZW50cyBwcmV2ZW50RGVmYXVsdCBvbiBsaW5rcyB0aGF0IGRvbid0IGhhdmUgYW4gaHJlZiBhdHRyaWJ1dGVcclxuLy8gQ29tcGxleCBKYXZhU2NyaXB0IERPTSBtYW5pcHVsYXRpb24gc2hvdWxkIGFsd2F5cyBiZSBkb25lIGluIGRpcmVjdGl2ZSBsaW5rIGZ1bmN0aW9ucywgYW5kICRhcHBseSBzaG91bGQgbmV2ZXIgYmUgdXNlZCBpbiBhIGNvbnRyb2xsZXIhIFNpbXBsZSBET00gbWFuaXB1bGF0aW9uIHNob3VsZCBiZSBpbiB0aGUgdmlldy5cclxuXHJcbi8qLS0tIFNhbXBsZSBEaXJlY3RpdmUgd2l0aCBhICR3YXRjaCAtLS0qL1xyXG4oZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuZGlyZWN0aXZlKCdzYW1wbGVEaXJlY3RpdmUnLCBzYW1wbGVEaXJlY3RpdmUpO1xyXG5cclxuXHRzYW1wbGVEaXJlY3RpdmUuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcclxuXHQvKipcclxuXHQgKiBzYW1wbGVEaXJlY3RpdmUgZGlyZWN0aXZlXHJcblx0ICogU2FtcGxlIGRpcmVjdGl2ZSB3aXRoIGlzb2xhdGUgc2NvcGUsXHJcblx0ICogY29udHJvbGxlciwgbGluaywgdHJhbnNjbHVzaW9uXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBkaXJlY3RpdmVcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzYW1wbGVEaXJlY3RpdmUoJHRpbWVvdXQpIHtcclxuXHJcblx0XHRzYW1wbGVEaXJlY3RpdmVMaW5rLiRpbmplY3QgPSBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnc2QnXTtcclxuXHRcdC8qKlxyXG5cdFx0ICogc2FtcGxlRGlyZWN0aXZlIExJTksgZnVuY3Rpb25cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gJHNjb3BlXHJcblx0XHQgKiBAcGFyYW0gJGVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcclxuXHRcdCAqIEBwYXJhbSBzZCB7Y29udHJvbGxlcn1cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2FtcGxlRGlyZWN0aXZlTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIHNkKSB7XHJcblx0XHRcdC8vIHdhdGNoIGZvciBhc3luYyBkYXRhIHRvIGJlY29tZSBhdmFpbGFibGUgYW5kIHVwZGF0ZVxyXG5cdFx0XHQkc2NvcGUuJHdhdGNoKCdzZC5qc29uRGF0YScsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0XHRcdFx0aWYgKG5ld1ZhbCkge1xyXG5cdFx0XHRcdFx0c2QuanNvbkRhdGEgPSBuZXdWYWw7XHJcblxyXG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdkZW1vbnN0cmF0ZSAkdGltZW91dCBpbmplY3Rpb24gaW4gYSBkaXJlY3RpdmUgbGluayBmdW5jdGlvbicpO1xyXG5cdFx0XHRcdFx0fSwgMTAwMCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcclxuXHRcdFx0cmVwbGFjZTogdHJ1ZSxcclxuXHRcdFx0c2NvcGU6IHtcclxuXHRcdFx0XHRqc29uRGF0YTogJz0nXHJcblx0XHRcdH0sXHJcblx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3N1Yi9zYW1wbGUudHBsLmh0bWwnLFxyXG5cdFx0XHR0cmFuc2NsdWRlOiB0cnVlLFxyXG5cdFx0XHRjb250cm9sbGVyOiBTYW1wbGVEaXJlY3RpdmVDdHJsLFxyXG5cdFx0XHRjb250cm9sbGVyQXM6ICdzZCcsXHJcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXHJcblx0XHRcdGxpbms6IHNhbXBsZURpcmVjdGl2ZUxpbmtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRTYW1wbGVEaXJlY3RpdmVDdHJsLiRpbmplY3QgPSBbXTtcclxuXHQvKipcclxuXHQgKiBzYW1wbGVEaXJlY3RpdmUgQ09OVFJPTExFUlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFNhbXBsZURpcmVjdGl2ZUN0cmwoKSB7XHJcblx0XHR2YXIgc2QgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGNvbnRyb2xsZXIgbG9naWMgZ29lcyBoZXJlXHJcblx0fVxyXG5cclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=