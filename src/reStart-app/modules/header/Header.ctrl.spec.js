; (function () {
    describe('Module: reStart', function () {
        var $controller, $rootScope;
        beforeEach(function () {
            module('reStart');
            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
            });
        });
        describe('Controller: HeaderCtrl', function () {

            var scope, headerVm;
            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                headerVm = $controller('HeaderCtrl as headerVm', { $scope: scope });
            }));

            it("Apply class to index nav if active", function () {
                expect(headerVm.indexIsActive('/')).toBeTruthy();
            })
            it("Apply class to currently active nav item", function () {
                expect(headerVm.navIsActive('/')).toBeTruthy();
            })

        });
    });
})();