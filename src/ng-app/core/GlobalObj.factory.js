// "global" object to share between controllers
(function() {
	'use strict';

	myApp.factory('GlobalObj', GlobalObj);

	function GlobalObj() {
		return {
			greeting: 'Hello'
		};
	}
})();