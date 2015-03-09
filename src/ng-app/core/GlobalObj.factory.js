// "global" object to share between controllers
myApp.factory('GlobalObj', function() {
	return {
		greeting: 'Hello'
	};
});