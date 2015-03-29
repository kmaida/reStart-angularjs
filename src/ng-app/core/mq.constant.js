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