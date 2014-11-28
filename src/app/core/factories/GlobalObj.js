// "global" object to share between controllers
app.factory('GlobalObj', function() {
	return {
		greeting: 'Hello'
	};
});