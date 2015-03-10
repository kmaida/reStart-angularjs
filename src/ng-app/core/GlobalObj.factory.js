// "global" object to share between controllers
(function() {
	'use strict';

	myApp.factory('GlobalObj', function() {
		return {
			greeting: 'Hello'
		};
	});
})();