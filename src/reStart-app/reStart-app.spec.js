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
; (function () {
    describe('Module: reStart', function () {
        var $factory;
        beforeEach(function () {
            module('reStart');
        });
        describe('Factory: Page', function () {

            var page;
            beforeEach(inject(function ($injector) {
                page = $injector.get('Page');
            }));

            it('Gets the page title', function () {
                var title=page.getTitle();
                expect(title).toEqual('reStart Angular | Home');
            })
            it('Sets the page title', function () {
                page.setTitle('New');
                expect(page.getTitle()).toEqual('reStart Angular | New');
            })

        });
    });
})();
; (function () {
    describe('Module: reStart', function () {
        var $factory;
        beforeEach(function () {
            module('reStart');
        });
        describe('Factory: Utils', function () {

            var utils;
            beforeEach(inject(function ($injector) {
                utils = $injector.get('Utils');
            }));

            it('Gets the greeting', function () {
                var greeting = utils.greeting;
                expect(greeting).toEqual('Hello');
            })
            it('Greets given name', function () {
                spyOn(utils,'alertGreeting')
                utils.alertGreeting('Named');
                expect(utils.alertGreeting).toHaveBeenCalledWith("Named")
            })

        });
    });
})();
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
        describe('Controller: HeaderCtrl', function () {

            var scope, headerVm;
            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                headerVm = $controller('HeaderCtrl as headerVm', { $scope: scope });
            }));

            it("Apply class to index nav if active", function () {
                expect(headerVm.indexIsActive('/')).toBeTruthy();
            })
            it("Apply class to currently active nav item", function () {
                expect(headerVm.navIsActive('/')).toBeTruthy();
            })

        });
    });
})();
; (function () {
    var $compile, $rootScope,scope,element;
    beforeEach(function () {
        module('reStart');
    });

    describe('Directive: navControl', function () {
        beforeEach(function () {
            module('templates');

            //disable loading directive?
            angular.module("reStart").directive("loading", function (loading) {
                return {
                    priority: 100000,
                    terminal: true,
                    link: function () {
                        // do nothing
                    }
                }
            });

            inject(
                ['$compile', '$rootScope', function ($c, $r) {
                    $compile = $c;
                    $rootScope = $r;
                    scope = $rootScope.$new();
                }]
            )
            element = $compile('<div nav-control><a class="toggle-offcanvas" ng-click="nav.toggleNav()"><span></span></a></div>')($rootScope);
            angular.element(document.body).append(element);
            $('loading').remove();
            //trigger directive to be injected
            $rootScope.$digest();
        });

        xit("toggles nav on and off", function () {
            angular.element('.toggle-offcanvas').click();
            $rootScope.$digest();
            console.log(angular.element('body')[0])
            expect(angular.element('body').hasClass('nav-closed')).toBeFalsy();
        })
    });
})();
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
; (function () {
    var $compile, $rootScope;
    beforeEach(function () {
        module('reStart');
    });

    describe('Directive: Loading', function () {
        var element;
        beforeEach(function () {
            module('templates');
            inject(
                ['$compile', '$rootScope', function ($c, $r) {
                    $compile = $c;
                    $rootScope = $r;
                }]
            )
            element = $compile('<loading></loading>')($rootScope);
            angular.element(document.body).append(element);
            //trigger directive to be injected
            $rootScope.$digest();
        });

        it("should load the loading template", function () {
            expect(element.text()).toBeFalsy();
        })

        afterEach(function () {
            element.remove();
        });
    });
})();
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
; (function () {
    var $compile, $rootScope, scope, element;
    beforeEach(function () {
        module('reStart');
    });

    describe('Directive: navControl', function () {
        beforeEach(function () {
            module('templates');

            inject(
                ['$compile', '$rootScope', function ($c, $r) {
                    $compile = $c;
                    $rootScope = $r;
                    scope = $rootScope.$new();
                }]
            )
            element = $compile('<sample-directive json-data="sub.json">'+"I've been transcluded!"+'</sample-directive>')($rootScope);
            angular.element(document.body).append(element);
            //trigger directive to be injected
            $rootScope.$digest();
        });

        it("injects a template via directive", function () {
            expect(angular.element('body').html()).toContain("included by a directive");
        });
        it("transcludes data to the injected template", function () {
            expect(angular.element('.transclude').html()).toContain("I've been transcluded!");
        });
    });
})();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvUGFnZS5jdHJsLnNwZWMuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5zcGVjLmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LnNwZWMuanMiLCJtb2R1bGVzL2hlYWRlci9IZWFkZXIuY3RybC5zcGVjLmpzIiwibW9kdWxlcy9oZWFkZXIvbmF2Q29udHJvbC5kaXIuc3BlYy5qcyIsImNvcmUvZ2V0LWRhdGEvSlNPTkRhdGEuZmFjdG9yeS5zcGVjLmpzIiwiY29yZS9nZXQtZGF0YS9SZXMuZmFjdG9yeS5zcGVjLmpzIiwiY29yZS91aS9sb2FkaW5nLmRpci5zcGVjLmpzIiwiY29yZS91aS90cnVzdEFzSFRNTC5maWx0ZXIuc3BlYy5qcyIsInBhZ2VzL2Vycm9yNDA0L0Vycm9yNDA0LmN0cmwuc3BlYy5qcyIsInBhZ2VzL2hvbWUvSG9tZS5jdHJsLnNwZWMuanMiLCJwYWdlcy9zdWIvc2FtcGxlLmRpci5zcGVjLmpzIiwicGFnZXMvc3ViL1N1Yi5jdHJsLnNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJyZVN0YXJ0LWFwcC5zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiOyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZGVzY3JpYmUoJ01vZHVsZTogcmVTdGFydCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGNvbnRyb2xsZXIsICRyb290U2NvcGU7XHJcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1vZHVsZSgncmVTdGFydCcpO1xyXG4gICAgICAgICAgICBpbmplY3QoZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcclxuICAgICAgICAgICAgICAgICRjb250cm9sbGVyID0gJGluamVjdG9yLmdldCgnJGNvbnRyb2xsZXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0NvbnRyb2xsZXI6IFBhZ2VDdHJsJywgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjb3BlLCBwYWdlVm0sIGJyb2FkY2FzdDtcclxuICAgICAgICAgICAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24gKCRjb250cm9sbGVyLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZSA9ICRyb290U2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgICAgcGFnZVZtID0gJGNvbnRyb2xsZXIoJ1BhZ2VDdHJsIGFzIHBhZ2VWbScsIHsgJHNjb3BlOiBzY29wZSB9KTtcclxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICBpdChcIkJyb2FkY2FzdHMgbG9hZGluZy1vbiBldmVudFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJ2xvYWRpbmctb24nLCBicm9hZGNhc3RSZWNpZXZlZCk7XHJcbiAgICAgICAgICAgICAgICBwYWdlVm0ubG9hZGluZ09uKCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoYnJvYWRjYXN0KS50b0JlVHJ1dGh5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGl0KFwiQnJvYWRjYXN0cyBsb2FkaW5nLW9mZiBldmVudFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgYnJvYWRjYXN0UmVjaWV2ZWQpO1xyXG4gICAgICAgICAgICAgICAgcGFnZVZtLmxvYWRpbmdPZmYoKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChicm9hZGNhc3QpLnRvQmVUcnV0aHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXQoXCJCcm9hZGNhc3RzIGVudGVyLW1vYmlsZSBldmVudFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIGJyb2FkY2FzdFJlY2lldmVkKTtcclxuICAgICAgICAgICAgICAgIHBhZ2VWbS5lbnRlck1vYmlsZSgpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGJyb2FkY2FzdCkudG9CZVRydXRoeSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdChcIkJyb2FkY2FzdHMgZXhpdC1tb2JpbGUgZXZlbnRcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIGJyb2FkY2FzdFJlY2lldmVkKTtcclxuICAgICAgICAgICAgICAgIHBhZ2VWbS5leGl0TW9iaWxlKCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoYnJvYWRjYXN0KS50b0JlVHJ1dGh5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBicm9hZGNhc3RSZWNpZXZlZCgpIHtcclxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZSgnTW9kdWxlOiByZVN0YXJ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkZmFjdG9yeTtcclxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbW9kdWxlKCdyZVN0YXJ0Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0ZhY3Rvcnk6IFBhZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFnZTtcclxuICAgICAgICAgICAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgcGFnZSA9ICRpbmplY3Rvci5nZXQoJ1BhZ2UnKTtcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0dldHMgdGhlIHBhZ2UgdGl0bGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGU9cGFnZS5nZXRUaXRsZSgpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHRpdGxlKS50b0VxdWFsKCdyZVN0YXJ0IEFuZ3VsYXIgfCBIb21lJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGl0KCdTZXRzIHRoZSBwYWdlIHRpdGxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcGFnZS5zZXRUaXRsZSgnTmV3Jyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocGFnZS5nZXRUaXRsZSgpKS50b0VxdWFsKCdyZVN0YXJ0IEFuZ3VsYXIgfCBOZXcnKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZSgnTW9kdWxlOiByZVN0YXJ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkZmFjdG9yeTtcclxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbW9kdWxlKCdyZVN0YXJ0Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0ZhY3Rvcnk6IFV0aWxzJywgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHV0aWxzO1xyXG4gICAgICAgICAgICBiZWZvcmVFYWNoKGluamVjdChmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICB1dGlscyA9ICRpbmplY3Rvci5nZXQoJ1V0aWxzJyk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdHZXRzIHRoZSBncmVldGluZycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBncmVldGluZyA9IHV0aWxzLmdyZWV0aW5nO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGdyZWV0aW5nKS50b0VxdWFsKCdIZWxsbycpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdCgnR3JlZXRzIGdpdmVuIG5hbWUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzcHlPbih1dGlscywnYWxlcnRHcmVldGluZycpXHJcbiAgICAgICAgICAgICAgICB1dGlscy5hbGVydEdyZWV0aW5nKCdOYW1lZCcpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHV0aWxzLmFsZXJ0R3JlZXRpbmcpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFwiTmFtZWRcIilcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZSgnTW9kdWxlOiByZVN0YXJ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkY29udHJvbGxlciwgJHJvb3RTY29wZTtcclxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbW9kdWxlKCdyZVN0YXJ0Jyk7XHJcbiAgICAgICAgICAgIGluamVjdChmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xyXG4gICAgICAgICAgICAgICAgJGNvbnRyb2xsZXIgPSAkaW5qZWN0b3IuZ2V0KCckY29udHJvbGxlcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZXNjcmliZSgnQ29udHJvbGxlcjogSGVhZGVyQ3RybCcsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBzY29wZSwgaGVhZGVyVm07XHJcbiAgICAgICAgICAgIGJlZm9yZUVhY2goaW5qZWN0KGZ1bmN0aW9uICgkY29udHJvbGxlciwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICAgIGhlYWRlclZtID0gJGNvbnRyb2xsZXIoJ0hlYWRlckN0cmwgYXMgaGVhZGVyVm0nLCB7ICRzY29wZTogc2NvcGUgfSk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIGl0KFwiQXBwbHkgY2xhc3MgdG8gaW5kZXggbmF2IGlmIGFjdGl2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoaGVhZGVyVm0uaW5kZXhJc0FjdGl2ZSgnLycpKS50b0JlVHJ1dGh5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGl0KFwiQXBwbHkgY2xhc3MgdG8gY3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoaGVhZGVyVm0ubmF2SXNBY3RpdmUoJy8nKSkudG9CZVRydXRoeSgpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KSgpOyIsIjsgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkY29tcGlsZSwgJHJvb3RTY29wZSxzY29wZSxlbGVtZW50O1xyXG4gICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbW9kdWxlKCdyZVN0YXJ0Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnRGlyZWN0aXZlOiBuYXZDb250cm9sJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBtb2R1bGUoJ3RlbXBsYXRlcycpO1xyXG5cclxuICAgICAgICAgICAgLy9kaXNhYmxlIGxvYWRpbmcgZGlyZWN0aXZlP1xyXG4gICAgICAgICAgICBhbmd1bGFyLm1vZHVsZShcInJlU3RhcnRcIikuZGlyZWN0aXZlKFwibG9hZGluZ1wiLCBmdW5jdGlvbiAobG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogMTAwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlcm1pbmFsOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpbmplY3QoXHJcbiAgICAgICAgICAgICAgICBbJyRjb21waWxlJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJGMsICRyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGUgPSAkYztcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlID0gJHI7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgZWxlbWVudCA9ICRjb21waWxlKCc8ZGl2IG5hdi1jb250cm9sPjxhIGNsYXNzPVwidG9nZ2xlLW9mZmNhbnZhc1wiIG5nLWNsaWNrPVwibmF2LnRvZ2dsZU5hdigpXCI+PHNwYW4+PC9zcGFuPjwvYT48L2Rpdj4nKSgkcm9vdFNjb3BlKTtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChlbGVtZW50KTtcclxuICAgICAgICAgICAgJCgnbG9hZGluZycpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAvL3RyaWdnZXIgZGlyZWN0aXZlIHRvIGJlIGluamVjdGVkXHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB4aXQoXCJ0b2dnbGVzIG5hdiBvbiBhbmQgb2ZmXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KCcudG9nZ2xlLW9mZmNhbnZhcycpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKVswXSlcclxuICAgICAgICAgICAgZXhwZWN0KGFuZ3VsYXIuZWxlbWVudCgnYm9keScpLmhhc0NsYXNzKCduYXYtY2xvc2VkJykpLnRvQmVGYWxzeSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZSgnTW9kdWxlOiByZVN0YXJ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkcm9vdFNjb3BlO1xyXG4gICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBtb2R1bGUoJ3JlU3RhcnQnKTtcclxuICAgICAgICAgICAgaW5qZWN0KGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRlc2NyaWJlKCdGYWN0b3J5OiBKU09ORGF0YScsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBKU09ORGF0YTtcclxuICAgICAgICAgICAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24gKF9KU09ORGF0YV8sXyRxXykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gXyRxXy5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgSlNPTkRhdGEgPSBfSlNPTkRhdGFfO1xyXG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsnbG9jYWwnOidkYXRhJ30pO1xyXG4gICAgICAgICAgICAgICAgc3B5T24oSlNPTkRhdGEsICdnZXRMb2NhbERhdGEnKS5hbmQucmV0dXJuVmFsdWUoZGVmZXJyZWQucHJvbWlzZSk7XHJcblxyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnR2V0cyBsb2NhbCBkYXRhJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGE7XHJcbiAgICAgICAgICAgICAgICBKU09ORGF0YS5nZXRMb2NhbERhdGEoKS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGpzb247XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJvb3RTY29wZS4kYXBwbHkoKVxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRhdGEubG9jYWwpLnRvRXF1YWwoJ2RhdGEnKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZSgnTW9kdWxlOiByZVN0YXJ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkZmFjdG9yeTtcclxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbW9kdWxlKCdyZVN0YXJ0Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0ZhY3Rvcnk6IFJlcycsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXM7XHJcbiAgICAgICAgICAgIGJlZm9yZUVhY2goaW5qZWN0KGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcclxuICAgICAgICAgICAgICAgIHJlcyA9ICRpbmplY3Rvci5nZXQoJ1JlcycpO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnQ2hlY2tzIGlmIHJlc3BvbnNlIGlzIG9mIHR5cGUgb2JqZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHsgZGF0YToge0lhbTonb2JqJ30gfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gcmVzLnN1Y2Nlc3Mob2JqKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZXNwb25zZS5JYW0pLnRvRXF1YWwoJ29iaicpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdCgnVGhyb3dzIGFuIGVycm9yIGlmIGRhdGEgaXMgbm90IG9mIHR5cGUgb2JqJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlcy5zdWNjZXNzKS50b1Rocm93KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGl0KCdSZXNwb25kcyB0byBFcnJvcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZXMuZXJyb3IpLnRvVGhyb3coKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJGNvbXBpbGUsICRyb290U2NvcGU7XHJcbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBtb2R1bGUoJ3JlU3RhcnQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCdEaXJlY3RpdmU6IExvYWRpbmcnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQ7XHJcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1vZHVsZSgndGVtcGxhdGVzJyk7XHJcbiAgICAgICAgICAgIGluamVjdChcclxuICAgICAgICAgICAgICAgIFsnJGNvbXBpbGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkYywgJHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkY29tcGlsZSA9ICRjO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUgPSAkcjtcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgZWxlbWVudCA9ICRjb21waWxlKCc8bG9hZGluZz48L2xvYWRpbmc+JykoJHJvb3RTY29wZSk7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIC8vdHJpZ2dlciBkaXJlY3RpdmUgdG8gYmUgaW5qZWN0ZWRcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KFwic2hvdWxkIGxvYWQgdGhlIGxvYWRpbmcgdGVtcGxhdGVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBleHBlY3QoZWxlbWVudC50ZXh0KCkpLnRvQmVGYWxzeSgpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGFmdGVyRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBtb2R1bGUoJ3JlU3RhcnQnKTtcclxuICAgIH0pO1xyXG4gICAgZGVzY3JpYmUoJ0ZpbHRlcjogVHJ1c3QgQXMgSFRNTCcsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaXQoJ2hhcyBhIHR1c3QgYXMgaHRtbCBmaWx0ZXInLCBpbmplY3QoZnVuY3Rpb24gKCRmaWx0ZXIpIHtcclxuICAgICAgICAgICAgZXhwZWN0KCRmaWx0ZXIoJ3RydXN0QXNIVE1MJykpLm5vdC50b0JlTnVsbCgpO1xyXG4gICAgICAgIH0pKTtcclxuXHJcblxyXG4gICAgICAgIGl0KCd1c2VzIHNjZSB0byB0cnVzdCB0ZXh0IGFzIGh0bWwnLCBpbmplY3QoZnVuY3Rpb24gKCRmaWx0ZXIpIHtcclxuICAgICAgICAgICAgdmFyIHRydXN0QXNIVE1MID0gJGZpbHRlcigndHJ1c3RBc0hUTUwnKTtcclxuICAgICAgICAgICAgZXhwZWN0KHRydXN0QXNIVE1MKFwiPGRpdj5cIikpLnRvQmVUcnV0aHkoKTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9KTtcclxufSkoKTsiLCI7IChmdW5jdGlvbiAoKSB7XHJcbiAgICBkZXNjcmliZSgnTW9kdWxlOiByZVN0YXJ0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkY29udHJvbGxlciwgJHJvb3RTY29wZTtcclxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbW9kdWxlKCdyZVN0YXJ0Jyk7XHJcbiAgICAgICAgICAgIGluamVjdChmdW5jdGlvbiAoJGluamVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xyXG4gICAgICAgICAgICAgICAgJGNvbnRyb2xsZXIgPSAkaW5qZWN0b3IuZ2V0KCckY29udHJvbGxlcicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZXNjcmliZSgnQ29udHJvbGxlcjogRXJyb3I0MDRDdHJsJywgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjb3BlLCBFcnJvcjQwNFZtLCBicm9hZGNhc3Q7XHJcbiAgICAgICAgICAgIGJlZm9yZUVhY2goaW5qZWN0KGZ1bmN0aW9uICgkY29udHJvbGxlciwgJHJvb3RTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICAgIEVycm9yNDA0Vm0gPSAkY29udHJvbGxlcignRXJyb3I0MDRDdHJsIGFzIEVycm9yNDA0Vm0nLCB7ICRzY29wZTogc2NvcGUgfSk7XHJcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgaXQoXCJTZW5kcyBhIGxvYWRpbmctb2ZmIG1lc3NhZ2VcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdsb2FkaW5nLW9mZicsIGJyb2FkY2FzdFJlY2lldmVkKTtcclxuICAgICAgICAgICAgICAgIEVycm9yNDA0Vm0uaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGJyb2FkY2FzdCkudG9CZVRydXRoeSgpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0UmVjaWV2ZWQoKSB7XHJcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pKCk7IiwiOyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZGVzY3JpYmUoJ01vZHVsZTogcmVTdGFydCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGNvbnRyb2xsZXIsICRyb290U2NvcGU7XHJcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1vZHVsZSgncmVTdGFydCcpO1xyXG4gICAgICAgICAgICBpbmplY3QoZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcclxuICAgICAgICAgICAgICAgICRjb250cm9sbGVyID0gJGluamVjdG9yLmdldCgnJGNvbnRyb2xsZXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0NvbnRyb2xsZXI6IEhvbWVDdHJsJywgZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjb3BlLCBob21lVm0sIGJyb2FkY2FzdDtcclxuICAgICAgICAgICAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24gKCRjb250cm9sbGVyLCAkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZSA9ICRyb290U2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgICAgaG9tZVZtID0gJGNvbnRyb2xsZXIoJ0hvbWVDdHJsIGFzIGhvbWVWbScsIHsgJHNjb3BlOiBzY29wZSB9KTtcclxuICAgICAgICAgICAgICAgIGJyb2FkY2FzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICBpdChcIkJyb2FkY2FzdHMgbG9hZGluZy1vbiBldmVudFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS4kb24oJ2xvYWRpbmctb24nLCBicm9hZGNhc3RSZWNpZXZlZCk7XHJcbiAgICAgICAgICAgICAgICBob21lVm0uYWN0aXZhdGUoKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChicm9hZGNhc3QpLnRvQmVUcnV0aHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXQoXCJsb2FkcyBkYXRhIGludG8gY29udHJvbGxlclwiLCBmdW5jdGlvbiAoKSB7ICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGV4cGVjdChob21lVm0uZ2V0SnNvblN1Y2Vzcyh7IGRhdGE6IFwieW9cIiB9KSkudG9CZVRydXRoeSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdChcIlNldHMgdmlldyBmb3JtYXQgdG8gc21hbGxcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaG9tZVZtLmVudGVyTW9iaWxlKCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoaG9tZVZtLmdldFZpZXcoKSkudG9FcXVhbChcInNtYWxsXCIpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGl0KFwiU2V0cyB2aWV3IGZvcm1hdCB0byBsYXJnZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBob21lVm0uZXhpdE1vYmlsZSgpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGhvbWVWbS5nZXRWaWV3KCkpLnRvRXF1YWwoXCJsYXJnZVwiKVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0UmVjaWV2ZWQoKSB7XHJcbiAgICAgICAgICAgICAgICBicm9hZGNhc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pKCk7IiwiOyAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICRjb21waWxlLCAkcm9vdFNjb3BlLCBzY29wZSwgZWxlbWVudDtcclxuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIG1vZHVsZSgncmVTdGFydCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ0RpcmVjdGl2ZTogbmF2Q29udHJvbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbW9kdWxlKCd0ZW1wbGF0ZXMnKTtcclxuXHJcbiAgICAgICAgICAgIGluamVjdChcclxuICAgICAgICAgICAgICAgIFsnJGNvbXBpbGUnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkYywgJHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkY29tcGlsZSA9ICRjO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUgPSAkcjtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZSA9ICRyb290U2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBlbGVtZW50ID0gJGNvbXBpbGUoJzxzYW1wbGUtZGlyZWN0aXZlIGpzb24tZGF0YT1cInN1Yi5qc29uXCI+JytcIkkndmUgYmVlbiB0cmFuc2NsdWRlZCFcIisnPC9zYW1wbGUtZGlyZWN0aXZlPicpKCRyb290U2NvcGUpO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAvL3RyaWdnZXIgZGlyZWN0aXZlIHRvIGJlIGluamVjdGVkXHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdChcImluamVjdHMgYSB0ZW1wbGF0ZSB2aWEgZGlyZWN0aXZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXhwZWN0KGFuZ3VsYXIuZWxlbWVudCgnYm9keScpLmh0bWwoKSkudG9Db250YWluKFwiaW5jbHVkZWQgYnkgYSBkaXJlY3RpdmVcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaXQoXCJ0cmFuc2NsdWRlcyBkYXRhIHRvIHRoZSBpbmplY3RlZCB0ZW1wbGF0ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGV4cGVjdChhbmd1bGFyLmVsZW1lbnQoJy50cmFuc2NsdWRlJykuaHRtbCgpKS50b0NvbnRhaW4oXCJJJ3ZlIGJlZW4gdHJhbnNjbHVkZWQhXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pKCk7IiwiOyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZGVzY3JpYmUoJ01vZHVsZTogcmVTdGFydCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGNvbnRyb2xsZXIsICRyb290U2NvcGU7XHJcbiAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1vZHVsZSgncmVTdGFydCcpO1xyXG4gICAgICAgICAgICBpbmplY3QoZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcclxuICAgICAgICAgICAgICAgICRjb250cm9sbGVyID0gJGluamVjdG9yLmdldCgnJGNvbnRyb2xsZXInKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0NvbnRyb2xsZXI6IFN1YkN0cmwnLCBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2NvcGUsIHN1YlZtO1xyXG4gICAgICAgICAgICBiZWZvcmVFYWNoKGluamVjdChmdW5jdGlvbiAoJGNvbnRyb2xsZXIsICRyb290U2NvcGUpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlID0gJHJvb3RTY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgICAgICBzdWJWbSA9ICRjb250cm9sbGVyKCdTdWJDdHJsIGFzIHN1YlZtJywgeyAkc2NvcGU6IHNjb3BlLCAnVXRpbHMnOicnLCAncmVzb2x2ZUxvY2FsRGF0YSc6e3N0dWZmOlwiQW5kIFRoaW5nc1wifX0pO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICBpdChcIlNldHMgdGhlIHBhZ2UgdGl0bGVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHN1YlZtLnRpdGxlKS50b0VxdWFsKFwiU3VicGFnZVwiKTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
