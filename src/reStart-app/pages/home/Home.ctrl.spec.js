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
        describe('Controller: HomeCtrl', function () {

            var scope, homeVm, broadcast;
            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                homeVm = $controller('HomeCtrl as homeVm', { $scope: scope });
                broadcast = false;
            }));

            it("Broadcasts loading-on event", function () {
                scope.$on('loading-on', broadcastRecieved);
                homeVm.activate();
                expect(broadcast).toBeTruthy();
            })
            it("loads data into controller", function () {              
                expect(homeVm.getJsonSucess({ data: "yo" })).toBeTruthy();
            })
            it("Sets view format to small", function () {
                homeVm.enterMobile();
                expect(homeVm.getView()).toEqual("small")
            })
            it("Sets view format to large", function () {
                homeVm.exitMobile();
                expect(homeVm.getView()).toEqual("large")
            })

            function broadcastRecieved() {
                broadcast = true;
            }

        });
    });
})();