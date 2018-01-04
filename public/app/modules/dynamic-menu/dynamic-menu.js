
angular.module('DynamicMenu', ['Home'])
        .controller('DynamicMenuController', ['$route', '$rootScope', '$scope', '$location', '$cookies',  'myService', 'AuthenticationService',  'webserviceFactory', 'constants', '$uibModal', '$timeout', 'storage', '$compile', '$notification',
            function($route, $rootScope, $scope, $location, $cookies, myService, AuthenticationService,  webserviceFactory, constants, $uibModal,  $timeout, storage, $compile, $notification) {
               

                $rootScope.$on('$locationChangeSuccess', function() {
                    $scope.checkRoute();


                });
                $scope.checkRoute = function()
                {
                    $rootScope.globals = JSON.parse(storage.getSessionValue('globals'));
                    ($rootScope.globals.currentUser) && ($rootScope.globals.currentUser.token = storage.getCookieValue('token'));
                    $scope.currentUser = $rootScope.globals.currentUser;
                    $scope.display = false;
                    if ($rootScope.globals.currentUser) {
                      
                        $scope.logo =  'default';
                      
                        
                        $scope.display = true;

                    }

                    var location = $location.path().split('/');
                    $scope.currenttab = location[1];
                   
                    $timeout(function() {
                        $rootScope.routeLoader = false;
                    }, 200);
                }
              
             
                $scope.logout = function()
                {
                    AuthenticationService.ClearCredentials();
                    AuthenticationService.saveAttemptUrl('/');
                    AuthenticationService.logoutuser();

                }
             $scope.cancel = function() {
                    $scope.activeModel ? $scope.activeModel.dismiss('cancel') : '';
                }
              
                $scope.checkRoute();
            }
        ]).directive('navigationBar', ['constants', function(constants) {
        // Runs during compile
        return {
            name: 'navigationBar',
            scope: {
                navigationDetail: '='
            },
            restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: 'modules/dynamic-menu/views/dynamic-menu' + constants.htmlFileToUse + '.html',
            replace: true,
        };
    }]);
