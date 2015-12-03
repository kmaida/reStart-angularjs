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
		var chromeversion = null;
		var $html = $('html');
		
		// Modernizr 2 bug: Chrome on Windows 8 gives a false negative for transforms3d support
		// Google does not plan to fix this; https://code.google.com/p/chromium/issues/detail?id=129004
		if (chrome) {
			chromeversion = ua.substr(ua.lastIndexOf('chrome/') + 7, 2);
			if (chromeversion >= 12 && $html.hasClass('no-csstransforms3d')) {
				$html
					.removeClass('no-csstransforms3d')
					.addClass('csstransforms3d');
			}
		}
	}
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG53aW5kb3cuaGVscGVycyA9IChmdW5jdGlvbigpIHtcclxuXHJcblx0aW5pdCgpO1xyXG5cclxuXHQvKioqXHJcblx0ICogZnVuY3Rpb24gaW5pdCgpXHJcblx0ICpcclxuXHQgKiBJbml0aWFsaXplIHB1YmxpYyB3aW5kb3cuaGVscGVycyBmdW5jdGlvbnNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0KCkge1xyXG5cdFx0Zml4QnJvd3NlcnMoKTtcclxuXHR9XHJcblxyXG5cdC8qKipcclxuXHQgKiBmdW5jdGlvbiBmaXhCcm93c2VycygpXHJcblx0ICpcclxuXHQgKiBGaXggYnJvd3NlciB3ZWlyZG5lc3NcclxuXHQgKiBDb3JyZWN0IE1vZGVybml6ciBidWdzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZml4QnJvd3NlcnMoKSB7XHJcblx0XHR2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XHJcblx0XHR2YXIgY2hyb21lID0gdWEubGFzdEluZGV4T2YoJ2Nocm9tZS8nKSA+IDA7XHJcblx0XHR2YXIgY2hyb21ldmVyc2lvbiA9IG51bGw7XHJcblx0XHR2YXIgJGh0bWwgPSAkKCdodG1sJyk7XHJcblx0XHRcclxuXHRcdC8vIE1vZGVybml6ciAyIGJ1ZzogQ2hyb21lIG9uIFdpbmRvd3MgOCBnaXZlcyBhIGZhbHNlIG5lZ2F0aXZlIGZvciB0cmFuc2Zvcm1zM2Qgc3VwcG9ydFxyXG5cdFx0Ly8gR29vZ2xlIGRvZXMgbm90IHBsYW4gdG8gZml4IHRoaXM7IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xMjkwMDRcclxuXHRcdGlmIChjaHJvbWUpIHtcclxuXHRcdFx0Y2hyb21ldmVyc2lvbiA9IHVhLnN1YnN0cih1YS5sYXN0SW5kZXhPZignY2hyb21lLycpICsgNywgMik7XHJcblx0XHRcdGlmIChjaHJvbWV2ZXJzaW9uID49IDEyICYmICRodG1sLmhhc0NsYXNzKCduby1jc3N0cmFuc2Zvcm1zM2QnKSkge1xyXG5cdFx0XHRcdCRodG1sXHJcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25vLWNzc3RyYW5zZm9ybXMzZCcpXHJcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ2Nzc3RyYW5zZm9ybXMzZCcpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==