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
					enter: 0,
					exit: 640
				},{
					label: 'large',
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
	res.init();
});