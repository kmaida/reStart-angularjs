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
        describe('Controller: SubCtrl', function () {

            var scope, subVm;
            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                subVm = $controller('SubCtrl as subVm', { $scope: scope, 'Utils':'', 'resolveLocalData':{stuff:"And Things"}});
            }));

            it("Sets the page title", function () {
                expect(subVm.title).toEqual("Subpage");
            })

        });
    });
})();