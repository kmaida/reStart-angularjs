'use strict';

window.helpers = (function() {

	init();

	/**
	 * function init()
	 *
	 * Initialize public window.helpers functions
	 */
	function init() {
		fixBrowsers();
	}

	/**
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
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG53aW5kb3cuaGVscGVycyA9IChmdW5jdGlvbigpIHtcclxuXHJcblx0aW5pdCgpO1xyXG5cclxuXHQvKipcclxuXHQgKiBmdW5jdGlvbiBpbml0KClcclxuXHQgKlxyXG5cdCAqIEluaXRpYWxpemUgcHVibGljIHdpbmRvdy5oZWxwZXJzIGZ1bmN0aW9uc1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXQoKSB7XHJcblx0XHRmaXhCcm93c2VycygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogZnVuY3Rpb24gZml4QnJvd3NlcnMoKVxyXG5cdCAqXHJcblx0ICogRml4IGJyb3dzZXIgd2VpcmRuZXNzXHJcblx0ICogQ29ycmVjdCBNb2Rlcm5penIgYnVnc1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGZpeEJyb3dzZXJzKCkge1xyXG5cdFx0dmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dmFyIGNocm9tZSA9IHVhLmxhc3RJbmRleE9mKCdjaHJvbWUvJykgPiAwO1xyXG5cdFx0dmFyIGNocm9tZXZlcnNpb24gPSBudWxsO1xyXG5cdFx0dmFyICRodG1sID0gJCgnaHRtbCcpO1xyXG5cdFx0XHJcblx0XHQvLyBNb2Rlcm5penIgMiBidWc6IENocm9tZSBvbiBXaW5kb3dzIDggZ2l2ZXMgYSBmYWxzZSBuZWdhdGl2ZSBmb3IgdHJhbnNmb3JtczNkIHN1cHBvcnRcclxuXHRcdC8vIEdvb2dsZSBkb2VzIG5vdCBwbGFuIHRvIGZpeCB0aGlzOyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTI5MDA0XHJcblx0XHRpZiAoY2hyb21lKSB7XHJcblx0XHRcdGNocm9tZXZlcnNpb24gPSB1YS5zdWJzdHIodWEubGFzdEluZGV4T2YoJ2Nocm9tZS8nKSArIDcsIDIpO1xyXG5cdFx0XHRpZiAoY2hyb21ldmVyc2lvbiA+PSAxMiAmJiAkaHRtbC5oYXNDbGFzcygnbm8tY3NzdHJhbnNmb3JtczNkJykpIHtcclxuXHRcdFx0XHQkaHRtbFxyXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduby1jc3N0cmFuc2Zvcm1zM2QnKVxyXG5cdFx0XHRcdFx0LmFkZENsYXNzKCdjc3N0cmFuc2Zvcm1zM2QnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufSgpKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
