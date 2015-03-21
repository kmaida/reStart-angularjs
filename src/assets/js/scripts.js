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
		var ua = navigator.userAgent.toLowerCase(),
			chrome = ua.lastIndexOf('chrome/') > 0,
			$html = $('html');
		
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxud2luZG93LmhlbHBlcnMgPSAoZnVuY3Rpb24oKSB7XHJcblx0XHJcblx0aW5pdCgpO1xyXG5cclxuXHQvKioqXHJcblx0ICogZnVuY3Rpb24gaW5pdCgpXHJcblx0ICpcclxuXHQgKiBJbml0aWFsaXplIHB1YmxpYyB3aW5kb3cuaGVscGVycyBmdW5jdGlvbnNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0KCkge1xyXG5cdFx0Zml4QnJvd3NlcnMoKTtcclxuXHR9XHJcblxyXG5cdC8qKipcclxuXHQgKiBmdW5jdGlvbiBmaXhCcm93c2VycygpXHJcblx0ICpcclxuXHQgKiBGaXggYnJvd3NlciB3ZWlyZG5lc3NcclxuXHQgKiBDb3JyZWN0IE1vZGVybml6ciBidWdzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZml4QnJvd3NlcnMoKSB7XHJcblx0XHR2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCksXHJcblx0XHRcdGNocm9tZSA9IHVhLmxhc3RJbmRleE9mKCdjaHJvbWUvJykgPiAwLFxyXG5cdFx0XHQkaHRtbCA9ICQoJ2h0bWwnKTtcclxuXHRcdFxyXG5cdFx0Ly8gTW9kZXJuaXpyIDIgYnVnOiBDaHJvbWUgb24gV2luZG93cyA4IGdpdmVzIGEgZmFsc2UgbmVnYXRpdmUgZm9yIHRyYW5zZm9ybXMzZCBzdXBwb3J0XHJcblx0XHQvLyBHb29nbGUgZG9lcyBub3QgcGxhbiB0byBmaXggdGhpczsgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTEyOTAwNFxyXG5cdFx0aWYgKGNocm9tZSkge1xyXG5cdFx0XHR2YXIgY2hyb21ldmVyc2lvbiA9IHVhLnN1YnN0cih1YS5sYXN0SW5kZXhPZignY2hyb21lLycpICsgNywgMik7XHJcblx0XHRcdGlmIChjaHJvbWV2ZXJzaW9uID49IDEyICYmICRodG1sLmhhc0NsYXNzKCduby1jc3N0cmFuc2Zvcm1zM2QnKSkge1xyXG5cdFx0XHRcdCRodG1sXHJcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25vLWNzc3RyYW5zZm9ybXMzZCcpXHJcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ2Nzc3RyYW5zZm9ybXMzZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==