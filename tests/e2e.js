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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuc3BlYy5qcyIsInN1YnBhZ2Uuc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJlMmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIFBhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5nZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGJyb3dzZXIuZ2V0KCdodHRwOi8vbG9jYWxob3N0OjgwMDAvJyk7XHJcbiAgICAgICAgICAgIGJyb3dzZXIud2FpdEZvckFuZ3VsYXIoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZ3JlZXQgPSBlbGVtZW50KGJ5LmJ1dHRvblRleHQoXCJHcmVldFwiKSk7XHJcbiAgICAgICAgdGhpcy5oZWFkaW5nID0gZWxlbWVudChieS5jc3MoJy5jb250ZW50LWhlYWRpbmcnKSk7XHJcbiAgICAgICAgdGhpcy5ob21lU3RyaW5nID0gZWxlbWVudChieS5jc3MoJy5ob21lLXN0cmluZycpKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBlbGVtZW50KGJ5LmNzcygnLmRpc3BsYXknKSk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gZWxlbWVudChieS5tb2RlbCgnaG9tZS5uYW1lJykpO1xyXG4gICAgICAgIHRoaXMubmF2U3ViID0gZWxlbWVudChieS5jc3MoJy5zdWItbmF2JykpO1xyXG4gICAgfVxyXG4gICAgZGVzY3JpYmUoJ3JlU3RhcnQtQW5ndWxhcjogSG9tZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcGFnZTtcclxuICAgICAgICB2YXIgd2lkdGggPSA4MDA7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IDYwMDtcclxuICAgICAgICB2YXIgbmV3VGV4dCA9IFwiQm9iXCJcclxuXHJcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBhZ2UgPSBuZXcgUGFnZSgpO1xyXG4gICAgICAgICAgICBwYWdlLmdldCgpO1xyXG4gICAgICAgICAgICBicm93c2VyLmRyaXZlci5tYW5hZ2UoKS53aW5kb3coKS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGl0KCdMb2FkcyB0aGUgaG9tZSBwYWdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBleHBlY3QocGFnZS5oZWFkaW5nLmdldFRleHQoKSkudG9Db250YWluKCdIb21lJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaXQoJ0dyZWV0cyBhIG5hbWUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBhZ2UuZ3JlZXQuY2xpY2soKTtcclxuICAgICAgICAgICAgdmFyIGFsZXJ0RGlhbG9nID0gYnJvd3Nlci5kcml2ZXIuc3dpdGNoVG8oKS5hbGVydCgpO1xyXG4gICAgICAgICAgICBleHBlY3QoYWxlcnREaWFsb2cuZ2V0VGV4dCgpKS50b0NvbnRhaW4oXCJIZWxsbyxcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaXQoJ1VwZGF0ZXMgdGV4dCBpbiBhbGVydCBpZiBpbnB1dCBjaGFuZ2VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwYWdlLm5hbWUuY2xlYXIoKTtcclxuICAgICAgICAgICAgcGFnZS5uYW1lLnNlbmRLZXlzKG5ld1RleHQpO1xyXG4gICAgICAgICAgICBwYWdlLmdyZWV0LmNsaWNrKCk7XHJcbiAgICAgICAgICAgIHZhciBhbGVydERpYWxvZyA9IGJyb3dzZXIuZHJpdmVyLnN3aXRjaFRvKCkuYWxlcnQoKTtcclxuICAgICAgICAgICAgZXhwZWN0KGFsZXJ0RGlhbG9nLmdldFRleHQoKSkudG9Db250YWluKG5ld1RleHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGl0KCdVcGRhdGVzIHRleHQgb24gcGFnZSBpZiBpbnB1dCBjaGFuZ2VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwYWdlLm5hbWUuY2xlYXIoKTtcclxuICAgICAgICAgICAgcGFnZS5uYW1lLnNlbmRLZXlzKG5ld1RleHQpO1xyXG4gICAgICAgICAgICBleHBlY3QocGFnZS5ob21lU3RyaW5nLmdldFRleHQoKSkudG9Db250YWluKG5ld1RleHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGl0KCdEaXNwbGF5cyBhIHRhYmxlIGFib3ZlIGEgY2VydGFpbiBzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBicm93c2VyLmRyaXZlci5tYW5hZ2UoKS53aW5kb3coKS5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICBleHBlY3QocGFnZS50eXBlLmdldFRleHQoKSkudG9Db250YWluKCdUYWJsZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGl0KCdEaXNwbGF5IGEgbGlzdCBiZWxvdyBhIGNlcnRhaW4gc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYnJvd3Nlci5kcml2ZXIubWFuYWdlKCkud2luZG93KCkuc2V0U2l6ZSg2MDAsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWdlLnR5cGUuZ2V0VGV4dCgpKS50b0NvbnRhaW4oJ0xpc3QnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpdCgnTmF2aWdhdGVzIHRvIHN1YnBhZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBhZ2UubmF2U3ViLmNsaWNrKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWdlLmhlYWRpbmcuZ2V0VGV4dCgpKS50b0NvbnRhaW4oJ1N1YnBhZ2UnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy9jbGVhciBhbGVydCBib3ggaWYgb3BlblxyXG4gICAgICAgICAgICBicm93c2VyLmRyaXZlci5zd2l0Y2hUbygpLmFsZXJ0KCkudGhlbihcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGFsZXJ0KSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydC5kaXNtaXNzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgUGFnZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmdldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYnJvd3Nlci5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zdWJwYWdlJyk7XHJcbiAgICAgICAgICAgIGJyb3dzZXIud2FpdEZvckFuZ3VsYXIoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaGVhZGluZyA9IGVsZW1lbnQoYnkuY3NzKCcuY29udGVudC1oZWFkaW5nJykpO1xyXG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBlbGVtZW50KGJ5LmNzcygnLnRlbXBsYXRlJykpO1xyXG4gICAgICAgIHRoaXMudHJhbnNjbHVkZSA9IGVsZW1lbnQoYnkuY3NzKCcudHJhbnNjbHVkZScpKTtcclxuICAgICAgICB0aGlzLm5hdkhvbWUgPSBlbGVtZW50KGJ5LmNzcygnLmhvbWUtbmF2JykpO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc2NyaWJlKCdyZVN0YXJ0LUFuZ3VsYXI6IFN1YnBhZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHBhZ2U7XHJcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBhZ2UgPSBuZXcgUGFnZSgpO1xyXG4gICAgICAgICAgICBwYWdlLmdldCgpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGl0KCdTaG91bGQgbG9hZCB0aGUgc3ViIHBhZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWdlLmhlYWRpbmcuZ2V0VGV4dCgpKS50b0NvbnRhaW4oJ1N1YnBhZ2UnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpdCgnaGFzIGEgdGVtcGxhdGUgaW5jbHVkZWQgYnkgYSBkaXJlY3RpdmUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWdlLnRlbXBsYXRlLmdldFRleHQoKSkudG9Db250YWluKCd0ZW1wbGF0ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGl0KCdoYXMgYSB0ZW1wbGF0ZSB0aGF0IHdhcyB0cmFuc2NsdWRlZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZ2UudHJhbnNjbHVkZS5nZXRUZXh0KCkpLnRvQ29udGFpbigndHJhbnNjbHVkZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGl0KCdOYXZpZ2F0ZXMgdG8gdGhlIGhvbWUgcGFnZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcGFnZS5uYXZIb21lLmNsaWNrKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWdlLmhlYWRpbmcuZ2V0VGV4dCgpKS50b0NvbnRhaW4oJ0hvbWUnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
