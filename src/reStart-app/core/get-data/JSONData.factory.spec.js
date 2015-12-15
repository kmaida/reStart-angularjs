; (function () {
    describe('Module: reStart', function () {
        var $rootScope;
        beforeEach(function () {
            module('reStart');
            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
            });
        });
        describe('Factory: JSONData', function () {

            var JSONData;
            beforeEach(inject(function (_JSONData_,_$q_) {
                var deferred = _$q_.defer();
                JSONData = _JSONData_;
                rootScope = $rootScope;

                deferred.resolve({'local':'data'});
                spyOn(JSONData, 'getLocalData').and.returnValue(deferred.promise);

            }));

            it('Gets local data', function () {
                var data;
                JSONData.getLocalData().then(function (json) {
                    data = json;
                });
                rootScope.$apply()
                expect(data.local).toEqual('data');
            })

        });
    });
})();