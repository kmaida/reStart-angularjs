//------------------------------------------------------------- General app functionality

var app = {

/*--- Init functions ---*/
	init: function() {
		app.fixBrowsers();	
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
	},	
};

//------------------------------------------------------------- Responsive functionality

var res = {
	$body: $(document.body),

/*--- Init responsive functions ---*/
	init: function() {
		// setup event listeners
		res.nav();

		// setup custom events	
		res.setupRes();
	},

/*--- Initialize and set up jRespond ---*/
	setupRes: function() {
		var jRes = jRespond([
				{
					label: 'small',
					mq: 'screen and (max-width: 640px)',
					enter: 0,
					exit: 640
				},{
					label: 'large',
					mq: 'screen and (min-width: 641px)',
					enter: 641,
					exit: 100000
				}
			]);

		// initialize breakpoint functions
		jRes.addFunc([
			{
				// apply/remove body classes and create events for enter- / exit- breakpoints
				// usage: res.$body.on('enter-[breakpoint]', function(e) { });
				breakpoint: '*',
				enter: function(bpContext) {
					res.$body
						.addClass('view-' + bpContext.entering)
						.trigger({
							type: 'enter-' + bpContext.entering,
							curBP: bpContext.entering,
							prevBP: bpContext.exiting
						});

				},
				exit: function(bpContext) {
					res.$body
						.removeClass('view-' + bpContext.exiting)
						.trigger({
							type: 'exit-' + bpContext.exiting,
							curBP: bpContext.entering,
							prevBP: bpContext.exiting
						});
				}
			}
		]);	
	},

/*--- Offcanvas Navigation ---*/
	nav: function() {
		var $toggle = $('.toggle-offcanvas'),
			openNav = function() {
				res.$body
					.removeClass('nav-closed')
					.addClass('nav-open');
			},
			closeNav = function() {
				res.$body
					.removeClass('nav-open')
					.addClass('nav-closed');
			};
		
		res.$body.on('enter-small', function(e) {
			res.$body.addClass('nav-closed');
			
			$toggle.on('click', function(e) {
				e.preventDefault();
				
				if (res.$body.hasClass('nav-closed')) {
					openNav();
				} else {
					closeNav();
				}
			});
		});
		
		res.$body.on('enter-large', function(e) {
			$toggle.off('click');
			res.$body.removeClass('nav-open nav-closed');
		});

		// provision for Angular single-page app
		$('#nav-global a').on('click', function(e) {
			if (res.$body.hasClass('view-small')) {
				closeNav();
			}
		});
	}
};

//------------------------------------------------------------- Initialize

$(function() {
	app.init();
	res.init();
});