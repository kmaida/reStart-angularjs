; (function () {
    var $compile, $rootScope,scope,element;
    beforeEach(function () {
        module('reStart');
    });

    describe('Directive: navControl', function () {
        beforeEach(function () {
            module('templates');

            //disable loading directive?
            angular.module("reStart").directive("loading", function (loading) {
                return {
                    priority: 100000,
                    terminal: true,
                    link: function () {
                        // do nothing
                    }
                }
            });

            inject(
                ['$compile', '$rootScope', function ($c, $r) {
                    $compile = $c;
                    $rootScope = $r;
                    scope = $rootScope.$new();
                }]
            )
            element = $compile('<div nav-control><a class="toggle-offcanvas" ng-click="nav.toggleNav()"><span></span></a></div>')($rootScope);
            angular.element(document.body).append(element);
            $('loading').remove();
            //trigger directive to be injected
            $rootScope.$digest();
        });

        xit("toggles nav on and off", function () {
            angular.element('.toggle-offcanvas').click();
            $rootScope.$digest();
            console.log(angular.element('body')[0])
            expect(angular.element('body').hasClass('nav-closed')).toBeFalsy();
        })
    });
})();