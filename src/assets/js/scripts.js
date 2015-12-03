'use strict';

window.helpers = (function() {

	init();

	/***
	 * function init()
	 *
	 * Initialize public window.helpers functions
	 */
	function init() {
		fixBrowsers();
	}

	/***
	 * function fixBrowsers()
	 *
	 * Fix browser weirdness
	 * Correct Modernizr bugs
	 */
	function fixBrowsers() {
		var ua = navigator.userAgent.toLowerCase();
		var chrome = ua.lastIndexOf('chrome/') > 0;
		var $html = $('html');
		
		// Modernizr 2 bug: Chrome on Windows 8 gives a false negative for transforms3d support
		// Google does not plan to fix this; https://code.google.com/p/chromium/issues/detail?id=129004
		if (chrome) {
			var chromeversion = ua.substr(ua.lastIndexOf('chrome/') + 7, 2);
			if (chromeversion >= 12 && $html.hasClass('no-csstransforms3d')) {
				$html
					.removeClass('no-csstransforms3d')
					.addClass('csstransforms3d');
			}
		}
	}
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxud2luZG93LmhlbHBlcnMgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG5cdGluaXQoKTtcclxuXHJcblx0LyoqKlxyXG5cdCAqIGZ1bmN0aW9uIGluaXQoKVxyXG5cdCAqXHJcblx0ICogSW5pdGlhbGl6ZSBwdWJsaWMgd2luZG93LmhlbHBlcnMgZnVuY3Rpb25zXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5pdCgpIHtcclxuXHRcdGZpeEJyb3dzZXJzKCk7XHJcblx0fVxyXG5cclxuXHQvKioqXHJcblx0ICogZnVuY3Rpb24gZml4QnJvd3NlcnMoKVxyXG5cdCAqXHJcblx0ICogRml4IGJyb3dzZXIgd2VpcmRuZXNzXHJcblx0ICogQ29ycmVjdCBNb2Rlcm5penIgYnVnc1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGZpeEJyb3dzZXJzKCkge1xyXG5cdFx0dmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dmFyIGNocm9tZSA9IHVhLmxhc3RJbmRleE9mKCdjaHJvbWUvJykgPiAwO1xyXG5cdFx0dmFyICRodG1sID0gJCgnaHRtbCcpO1xyXG5cdFx0XHJcblx0XHQvLyBNb2Rlcm5penIgMiBidWc6IENocm9tZSBvbiBXaW5kb3dzIDggZ2l2ZXMgYSBmYWxzZSBuZWdhdGl2ZSBmb3IgdHJhbnNmb3JtczNkIHN1cHBvcnRcclxuXHRcdC8vIEdvb2dsZSBkb2VzIG5vdCBwbGFuIHRvIGZpeCB0aGlzOyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTI5MDA0XHJcblx0XHRpZiAoY2hyb21lKSB7XHJcblx0XHRcdHZhciBjaHJvbWV2ZXJzaW9uID0gdWEuc3Vic3RyKHVhLmxhc3RJbmRleE9mKCdjaHJvbWUvJykgKyA3LCAyKTtcclxuXHRcdFx0aWYgKGNocm9tZXZlcnNpb24gPj0gMTIgJiYgJGh0bWwuaGFzQ2xhc3MoJ25vLWNzc3RyYW5zZm9ybXMzZCcpKSB7XHJcblx0XHRcdFx0JGh0bWxcclxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbm8tY3NzdHJhbnNmb3JtczNkJylcclxuXHRcdFx0XHRcdC5hZGRDbGFzcygnY3NzdHJhbnNmb3JtczNkJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9