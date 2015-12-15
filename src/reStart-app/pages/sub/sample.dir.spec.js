; (function () {
    var $compile, $rootScope, scope, element;
    beforeEach(function () {
        module('reStart');
    });

    describe('Directive: navControl', function () {
        beforeEach(function () {
            module('templates');

            inject(
                ['$compile', '$rootScope', function ($c, $r) {
                    $compile = $c;
                    $rootScope = $r;
                    scope = $rootScope.$new();
                }]
            )
            element = $compile('<sample-directive json-data="sub.json">'+"I've been transcluded!"+'</sample-directive>')($rootScope);
            angular.element(document.body).append(element);
            //trigger directive to be injected
            $rootScope.$digest();
        });

        it("injects a template via directive", function () {
            expect(angular.element('body').html()).toContain("included by a directive");
        });
        it("transcludes data to the injected template", function () {
            expect(angular.element('.transclude').html()).toContain("I've been transcluded!");
        });
    });
})();