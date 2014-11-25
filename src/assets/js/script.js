//------------------------------------------------------------- General app functionality

var helpers = {

/*--- Init functions ---*/
	init: function() {
		helpers.fixBrowsers();
	},

/*--- Fix browser weirdness ---*/
	fixBrowsers: function() {
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
};

//------------------------------------------------------------- Initialize

$(function() {
	helpers.init();
});