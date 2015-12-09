; (function () {
    var $compile, $rootScope;
    beforeEach(function () {
        module('reStart');
    });

    describe('Directive: Loading', function () {
        var element;
        beforeEach(function () {
            module('templates');
            inject(
                ['$compile', '$rootScope', function ($c, $r) {
                    $compile = $c;
                    $rootScope = $r;
                }]
            )
            element = $compile('<loading></loading>')($rootScope);
            angular.element(document.body).append(element);
            //trigger directive to be injected
            $rootScope.$digest();
        });

        it("should load the loading template", function () {
            expect(element.text()).toBeFalsy();
        })

        afterEach(function () {
            element.remove();
        });
    });
})();