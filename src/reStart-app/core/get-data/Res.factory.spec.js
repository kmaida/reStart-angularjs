; (function () {
    describe('Module: reStart', function () {
        var $factory;
        beforeEach(function () {
            module('reStart');
        });
        describe('Factory: Res', function () {

            var res;
            beforeEach(inject(function ($injector) {
                res = $injector.get('Res');
            }));

            it('Checks if response is of type object', function () {
                var obj = { data: {Iam:'obj'} }
                var response = res.success(obj);
                expect(response.Iam).toEqual('obj');
            })
            it('Throws an error if data is not of type obj', function () {
                expect(res.success).toThrow();
            })
            it('Responds to Error', function () {
                expect(res.error).toThrow();
            })

        });
    });
})();