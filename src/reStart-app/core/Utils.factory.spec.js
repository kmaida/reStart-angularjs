; (function () {
    describe('Module: reStart', function () {
        var $factory;
        beforeEach(function () {
            module('reStart');
        });
        describe('Factory: Utils', function () {

            var utils;
            beforeEach(inject(function ($injector) {
                utils = $injector.get('Utils');
            }));

            it('Gets the greeting', function () {
                var greeting = utils.greeting;
                expect(greeting).toEqual('Hello');
            })
            it('Greets given name', function () {
                spyOn(utils,'alertGreeting')
                utils.alertGreeting('Named');
                expect(utils.alertGreeting).toHaveBeenCalledWith("Named")
            })

        });
    });
})();