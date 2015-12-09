(function () {
    var Page = function () {
        this.get = function () {
            browser.get('http://localhost:8000/subpage');
            browser.waitForAngular();
        };
        this.heading = element(by.css('.content-heading'));
        this.template = element(by.css('.template'));
        this.transclude = element(by.css('.transclude'));
        this.navHome = element(by.css('.home-nav'));
    }

    describe('reStart-Angular: Subpage', function () {
        var page;
        beforeEach(function () {
            page = new Page();
            page.get();
        })

        it('Should load the sub page', function () {
            expect(page.heading.getText()).toContain('Subpage');
        });
        it('has a template included by a directive', function () {
            expect(page.template.getText()).toContain('template');
        });
        it('has a template that was transcluded', function () {
            expect(page.transclude.getText()).toContain('transclude');
        });
        it('Navigates to the home page', function () {
            page.navHome.click();
            expect(page.heading.getText()).toContain('Home');
        });

    });
})();