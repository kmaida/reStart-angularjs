; (function () {
    beforeEach(function () {
        module('reStart');
    });
    describe('Filter: Trust As HTML', function () {

        it('has a tust as html filter', inject(function ($filter) {
            expect($filter('trustAsHTML')).not.toBeNull();
        }));


        it('uses sce to trust text as html', inject(function ($filter) {
            var trustAsHTML = $filter('trustAsHTML');
            expect(trustAsHTML("<div>")).toBeTruthy();
        }));
    });
})();