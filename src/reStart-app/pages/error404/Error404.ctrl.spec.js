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
        describe('Controller: Error404Ctrl', function () {

            var scope, Error404Vm, broadcast;
            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                Error404Vm = $controller('Error404Ctrl as Error404Vm', { $scope: scope });
                broadcast = false;
            }));

            it("Sends a loading-off message", function () {
                scope.$on('loading-off', broadcastRecieved);
                Error404Vm.init();
                expect(broadcast).toBeTruthy();
            })

            function broadcastRecieved() {
                broadcast = true;
            }

        });
    });
})();