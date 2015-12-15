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
        describe('Controller: PageCtrl', function () {

            var scope, pageVm, broadcast;
            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                pageVm = $controller('PageCtrl as pageVm', { $scope: scope });
                broadcast = false;
            }));

            it("Broadcasts loading-on event", function () {
                scope.$on('loading-on', broadcastRecieved);
                pageVm.loadingOn();
                expect(broadcast).toBeTruthy();
            })
            it("Broadcasts loading-off event", function () {
                scope.$on('loading-off', broadcastRecieved);
                pageVm.loadingOff();
                expect(broadcast).toBeTruthy();
            })
            it("Broadcasts enter-mobile event", function () {
                scope.$on('enter-mobile', broadcastRecieved);
                pageVm.enterMobile();
                expect(broadcast).toBeTruthy();
            })
            it("Broadcasts exit-mobile event", function () {
                scope.$on('exit-mobile', broadcastRecieved);
                pageVm.exitMobile();
                expect(broadcast).toBeTruthy();
            })

            function broadcastRecieved() {
                broadcast = true;
            }

        });
    });
})();