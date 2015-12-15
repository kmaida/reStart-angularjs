(function () {
    var Page = function () {
        this.get = function () {
            browser.get('http://localhost:8000/');
            browser.waitForAngular();
        };
        this.greet = element(by.buttonText("Greet"));
        this.heading = element(by.css('.content-heading'));
        this.homeString = element(by.css('.home-string'));
        this.type = element(by.css('.display'));
        this.name = element(by.model('home.name'));
        this.navSub = element(by.css('.sub-nav'));
    }
    describe('reStart-Angular: Home', function () {
        var page;
        var width = 800;
        var height = 600;
        var newText = "Bob"

        beforeEach(function () {
            page = new Page();
            page.get();
            browser.driver.manage().window().setSize(width, height);
        })

        it('Loads the home page', function () {
            expect(page.heading.getText()).toContain('Home');
        });
        it('Greets a name', function () {
            page.greet.click();
            var alertDialog = browser.driver.switchTo().alert();
            expect(alertDialog.getText()).toContain("Hello,");
        });
        it('Updates text in alert if input changes', function () {
            page.name.clear();
            page.name.sendKeys(newText);
            page.greet.click();
            var alertDialog = browser.driver.switchTo().alert();
            expect(alertDialog.getText()).toContain(newText);
        });
        it('Updates text on page if input changes', function () {
            page.name.clear();
            page.name.sendKeys(newText);
            expect(page.homeString.getText()).toContain(newText);
        });
        it('Displays a table above a certain size', function () {
            browser.driver.manage().window().setSize(width, height);
            expect(page.type.getText()).toContain('Table');
        });
        it('Display a list below a certain size', function () {
            browser.driver.manage().window().setSize(600, height);
            expect(page.type.getText()).toContain('List');
        });
        it('Navigates to subpage', function () {
            page.navSub.click();
            expect(page.heading.getText()).toContain('Subpage');
        });

        afterEach(function () {
            //clear alert box if open
            browser.driver.switchTo().alert().then(
            function (alert) {
                alert.dismiss();
            },
            function (err) {
            });
        })
    });
})();