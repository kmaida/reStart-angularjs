var app = angular.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'mediaCheck'])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/HomeView.html'
			})
			.when('/subpage', {
				templateUrl: '/SubView.html'
			})
			.otherwise({
				redirectTo: '/'
			});
		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}]);

// media query constants
app.constant('MQ', {
	SMALL: '(max-width: 640px)',
	LARGE: '(min-width: 641px)'
});
// fetch JSON data to share between controllers
app.service('JSONData', ['$http', function($http) {
	this.getDataAsync = function(callback) {
		$http({
			method: 'GET',
			url: '/app/data/data.json'
		}).success(callback);
	}
}]);
var angularMediaCheck = angular.module('mediaCheck', []);

angularMediaCheck.service('mediaCheck', ['$window', '$timeout', function($window, $timeout) {
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
			debounceSpeed = !!debounce ? debounce : 250;

		if (hasMatchMedia) {
			mqChange = function(mq) {
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

			createListener = function() {
				mq = $window.matchMedia(query);
				mqListListener = function() { return mqChange(mq) };

				mq.addListener(mqListListener);

				// bind to the orientationchange event and fire mqChange
				$win.bind('orientationchange', mqListListener);

				// cleanup listeners when $scope is $destroyed
				$scope.$on('$destroy', function() {
					mq.removeListener(mqListListener);
					$win.unbind('orientationchange', mqListListener);
				});

				return mqChange(mq);
			};

			return createListener();

		} else {
			breakpoints = {};

			mqChange = function(mq) {
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

			var convertEmToPx = function(value) {
				var emElement = document.createElement('div');

				emElement.style.width = '1em';
				emElement.style.position = 'absolute';
				document.body.appendChild(emElement);
				px = value * emElement.offsetWidth;
				document.body.removeChild(emElement);

				return px;
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
				clearTimeout(debounceResize);
				debounceResize = $timeout(mmListener, debounceSpeed);
			};

			$win.bind('resize', fakeMatchMediaResize);

			$scope.$on('$destroy', function() {
				$win.unbind('resize', fakeMatchMediaResize);
			});

			return mmListener();
		}
	};
}]);
// "global" object to share between controllers
app.factory('GlobalObj', function() {
	return {
		greeting: 'Hello'
	};
});
app.controller('HeaderCtrl', ['$scope', '$location', '$routeParams', 'JSONData', function($scope, $location, $routeParams, JSONData) {
	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});

	// apply class to currently active nav item
	$scope.indexIsActive = function(path) {
		// path should be '/'
		return $location.path() === path;
	};
	$scope.navIsActive = function(path) {
		return $location.path().substr(0, path.length) === path;
	};
	
	// apply body class based on url
	$scope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
		var getBodyClass = function(url) {
				var bodyClass = url.substr(url.lastIndexOf('/') + 1);
				
				return !!bodyClass ? 'page-' + bodyClass : 'page-home';
			},
			oldBodyClass = getBodyClass(oldUrl),
			newBodyClass = getBodyClass(newUrl);
			
		angular.element('body')
			.removeClass(oldBodyClass)
			.addClass(newBodyClass);
	});
	
}]);
app.controller('HomeCtrl', ['$scope', 'GlobalObj', 'JSONData', function($scope, GlobalObj, JSONData) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// simple data binding example
	$scope.name = 'Visitor';

	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);
app.controller('SubCtrl', ['$scope', 'GlobalObj', 'JSONData', function($scope, GlobalObj, JSONData) {
	// put global variables in the scope
	$scope.global = GlobalObj;

	// get the data from JSON
	JSONData.getDataAsync(function(data) {
		$scope.json = data;
	});
}]);
app.directive('navControl', ['mediaCheck', 'MQ', '$timeout', function(mediaCheck, MQ, $timeout) {
	return {
		restrict: 'A',
		link: function($scope, $element, $attrs) {
			var $body = angular.element('body'),
				openNav = function() {
					$body
						.removeClass('nav-closed')
						.addClass('nav-open');
					},
				closeNav = function() {
					$body
						.removeClass('nav-open')
						.addClass('nav-closed');
				};

			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: function() {
					closeNav();

					$timeout(function() {
						$scope.toggleNav = function() {
							if ($body.hasClass('nav-closed')) {
								openNav();
							} else {
								closeNav();
							}
						};
					});

					$scope.$on('$locationChangeSuccess', closeNav);
				},
				exit: function() {
					$timeout(function() {
						$scope.toggleNav = null;
					});

					$body.removeClass('nav-closed nav-open');
				}
			});
		}
	};
}]);
/* 
	Wait for the ngRepeat DOM to load before executing a function (ie., useful if need to manipulate a DOM generated by ngRepeat elements)
	Reference: http://www.bennadel.com/blog/2592-hooking-into-the-complete-event-of-an-ngrepeat-loop-in-angularjs.htm
	
	Usage:
		VIEW:
			<li ng-repeat="enemy in enemies" repeat-complete="repeatDOMcomplete($index)"></li>
			
		CONTROLLER ($scope) or DIRECTIVE (scope):
			$scope.repeatDOMcomplete = function(index) {
				console.log('ngRepeat completed (' + index + ')!');
			};
*/

app.directive('repeatComplete', function($rootScope) {
	 
	// Because we can have multiple ng-repeat directives in
	// the same container, we need a way to differentiate
	// the different sets of elements. We'll add a unique ID
	// to each set.
	var uuid = 0;
	 
	// I compile the DOM node before it is linked by the
	// ng-repeat directive.
	function compile( tElement, tAttributes ) {
	 
		// Get the unique ID that we'll be using for this
		// particular instance of the directive.
		var id = ++uuid;
		 
		// Add the unique ID so we know how to query for
		// DOM elements during the digests.
		tElement.attr( "repeat-complete-id", id );
		 
		// Since this directive doesn't have a linking phase,
		// remove it from the DOM node.
		tElement.removeAttr( "repeat-complete" );
		 
		// Keep track of the expression we're going to
		// invoke once the ng-repeat has finished
		// rendering.
		var completeExpression = tAttributes.repeatComplete;
		 
		// Get the element that contains the list. We'll
		// use this element as the launch point for our
		// DOM search query.
		var parent = tElement.parent();
		 
		// Get the scope associated with the parent - we
		// want to get as close to the ngRepeat so that our
		// watcher will automatically unbind as soon as the
		// parent scope is destroyed.
		var parentScope = ( parent.scope() || $rootScope );
		 
		// Since we are outside of the ng-repeat directive,
		// we'll have to check the state of the DOM during
		// each $digest phase; BUT, we only need to do this
		// once, so save a referene to the un-watcher.
		var unbindWatcher = parentScope.$watch(function() {
		 
			console.info('Digest running.');
			 
			// Now that we're in a digest, check to see
			// if there are any ngRepeat items being
			// rendered. Since we want to know when the
			// list has completed, we only need the last
			// one we can find.
			var lastItem = parent.children( "*[ repeat-complete-id = '" + id + "' ]:last" );
			 
			// If no items have been rendered yet, stop.
			if (!lastItem.length) {
				return;
			}
		 
			// Get the local ng-repeat scope for the item.
			var itemScope = lastItem.scope();
			 
			// If the item is the "last" item as defined
			// by the ng-repeat directive, then we know
			// that the ng-repeat directive has finished
			// rendering its list (for the first time).
			if ( itemScope.$last ) {
				// Stop watching for changes - we only
				// care about the first complete rendering.
				unbindWatcher();
				 
				// Invoke the callback.
				itemScope.$eval( completeExpression ); 
			}
		});
	}
	 
	// Return the directive configuration. It's important
	// that this compiles before the ngRepeat directive
	// compiles the DOM node.
	return({
		compile: compile,
		priority: 1001,
		restrict: "A"
	});
	 
});
// Directives (and associated attributes) are camelCase in JS and snake-case in HTML
// Angular's built-in <a> directive automatically implements preventDefault on links that don't have an href attribute
// Complex JavaScript DOM manipulation should always be done in directives, and $apply should never be used in a controller! Simpler DOM manipulation should be in the view.

/*--- Sample Directive with a $watch ---*/
app.directive('directiveName', function() {
	return {
		restrict: 'A',
		templateUrl: 'view/tpl/TemplateTpl.html',
		transclude: true,
		link: function(scope, element, attrs) {
			// watch for async data to become available and update
			scope.$watch('json', function(json) {
				if (json) {	// safeguard against watched data being undefined
					
				}
			}, true);
		}
	};
});
// For events based on viewport size - updates as viewport is resized
app.directive('viewSwitch', ['mediaCheck', 'MQ', '$timeout', function(mediaCheck, MQ, $timeout) {
	return {
		restrict: 'A',
		controller: function($scope) {
			mediaCheck.init({
				scope: $scope,
				mq: MQ.SMALL,
				enter: function() {
					$timeout(function() {
						$scope.viewformat = 'small';
					});
				},
				exit: function() {
					$timeout(function() {
						$scope.viewformat = 'large';
					});
				}
			});
		}
	};
}]);