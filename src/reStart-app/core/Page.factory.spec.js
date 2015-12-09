; (function () {
    describe('Module: reStart', function () {
        var $factory;
        beforeEach(function () {
            module('reStart');
        });
        describe('Factory: Page', function () {

            var page;
            beforeEach(inject(function ($injector) {
                page = $injector.get('Page');
            }));

            it('Gets the page title', function () {
                var title=page.getTitle();
                expect(title).toEqual('reStart Angular | Home');
            })
            it('Sets the page title', function () {
                page.setTitle('New');
                expect(page.getTitle()).toEqual('reStart Angular | New');
            })

        });
    });
})();