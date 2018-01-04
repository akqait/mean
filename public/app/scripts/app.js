'use strict';

// declare modules
angular.module('Authentication', []);
angular.module('Common', []);
angular.module('Home', []);
angular.module('DynamicMenu', []);
angular.module('ServerHealthCheck', []);

angular.module('Myproject', [
    'Common', 'Authentication', 'rzModule',
    'Home', 'ServerHealthCheck',
    'ngRoute',
    'ngCookies',
    'DynamicMenu',
    'ngAnimate',
    'ngSanitize',
    'ui.bootstrap',
    'localytics.directives', 'FBAngular',
    'angularUtils.directives.dirPagination'
])
        .config(['$compileProvider', function($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|file|javascript):/);
            }])
        .config(['$routeProvider', '$locationProvider', 'constants', function($routeProvider, $locationProvider, constants) {

                $routeProvider
                        .when('/login/:id?', {
                            controller: 'LoginController',
                            templateUrl: function(attr) {
                                var param = attr.id ? attr.id : '';
                                return 'modules/authentication/views/login' + param + constants.htmlFileToUse + '.html';
                            },
                            css: 'css/login.css',
                            hideMenus: true
                        })
                        .when('/signup/:token', {
                            controller: 'LoginController',
                            templateUrl: 'modules/authentication/views/signup' + constants.htmlFileToUse + '.html',
                            hideMenus: true
                        })
                        .when('/editprofile', {
                            controller: 'EditProfileController',
                            templateUrl: 'modules/home/views/editprofile' + constants.htmlFileToUse + '.html',
                            hideMenus: true
                        })
                        .when('/viewprofile/:id?', {
                            controller: 'EditProfileController',
                            templateUrl: 'modules/home/views/viewprofile' + constants.htmlFileToUse + '.html',
                            hideMenus: true
                        })
                        .when('/profileimg', {
                            controller: 'EditProfileController',
                            templateUrl: 'modules/home/views/profileimg' + constants.htmlFileToUse + '.html',
                            hideMenus: true
                        })
                        .when('/reset/:user?', {
                            controller: 'LoginController',
                            templateUrl: 'modules/authentication/views/reset' + constants.htmlFileToUse + '.html',
                            hideMenus: true
                        })
                        
                        .when('/forgetpassword', {
                            controller: 'LoginController',
                            templateUrl: 'modules/authentication/views/forgetpassword' + constants.htmlFileToUse + '.html',
                            hideMenus: true
                        })
                        .when('/', {
                            controller: 'HomeController',
                            templateUrl: 'modules/home/views/home' + constants.htmlFileToUse + '.html',
                            resolve: {
                                init: function() {
                                    return function(scope) {
                                        scope.currenttab = 'home';
                                    }
                                }
                            }
                        })
                        .when('/unauthorize', {
                            templateUrl: 'modules/templates/unauthorized' + constants.htmlFileToUse + '.html'
                        })
                        .when('/maintenance', {
                            templateUrl: 'modules/templates/maintenance' + constants.htmlFileToUse + '.html'
                        })
              
                        .when('/healthcheck', {
                            templateUrl: 'modules/health-check/views/serverhealthcheck' + constants.htmlFileToUse + '.html',
                            controller: 'ServerHealthCheckController'

                        })
                        .otherwise({redirectTo: '/login'});

                $locationProvider.html5Mode(false).hashPrefix('app');
            }])

        .run(['$rootScope', '$location', '$http', 'AuthenticationService', '$notification', '$timeout', 'constants', 'storage', '$animate',
            function($rootScope, $location, $http, AuthenticationService, $notification, $timeout, constants, storage, $animate) {
                $rootScope.routeLoader = true;
                $rootScope.htmlFileToUse = constants.htmlFileToUse;
                $rootScope.$on('$locationChangeSuccess', function() {
                    $timeout(function() {
                        $rootScope.routeLoader = false;

                    }, 200);

                });
                // keep user logged in after page refresh
                $rootScope.$on('$locationChangeStart', function(event, next, current) {
                    $rootScope.routeLoader = true;
                    $animate.enabled(false);
                    $rootScope.globals = JSON.parse(storage.getSessionValue('globals'));
                    ($rootScope.globals.currentUser) && ($rootScope.globals.currentUser.token = storage.getCookieValue('token'));

                   

                    if ($rootScope.globals.currentUser) {
                        if (!$rootScope.globals.currentUser.is_eulaaccepted || !$rootScope.globals.currentUser.token)
                        {
                            AuthenticationService.saveAttemptUrl();
                            $rootScope.routeLoader = false;
                            $location.path('/login');
                        }
                       $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line			
                        $http.defaults.headers.common['x-access-token'] = $rootScope.globals.currentUser.token; // jshint ignore:line			
                    }

                    var currentLocation = $location.path();
                    var signUpIndex = currentLocation.indexOf('/signup')
                    var resetIndex = currentLocation.indexOf('/reset')

                    if ((currentLocation.indexOf('/unsubscribe') == -1) && (currentLocation.indexOf('/healthcheck') == -1 && currentLocation.indexOf('/login') == -1 && currentLocation !== '/forgetpassword' && signUpIndex == -1 && resetIndex == -1) && !$rootScope.globals.currentUser) {
                        AuthenticationService.saveAttemptUrl();
                        $rootScope.routeLoader = false;
                        $location.path('/login');
                    }
                   
                });
            }])
        .filter('orderByNumber', function() {
            return function(items, field, reverse) {
                var filtered = [];
                angular.forEach(items, function(item) {
                    filtered.push(item);
                });
                filtered.sort(function(a, b) {
                    return (a[field] > b[field] ? 1 : -1);
                });
                if (reverse)
                    filtered.reverse();
                return filtered;
            };
        })
        .filter('cmtoftinch', function() {
            return function(cms) {

                var inches = (cms * 0.393700787).toFixed(0);
                var feet = Math.floor(inches / 12);
                inches %= 12;

                return feet + "ft " + inches + "inches";

            };
        }).filter('ftinchtocm', function() {
    return function(ft, inch) {
        return parseInt(ft * 30.48 + inch * 2.54);
    };
}).filter('dateFilter', function() {
    return function(date) {

        if (!angular.isDefined(date) || date == null || date == '' || date.indexOf('0000') >= 0)
            return '-';
        var dateArr = date.split("T");
        var dateArr1 = date.split("/");
        if (dateArr.length == 1 || dateArr1.length > 1)
        {

            return date;
        }

        dateArr = dateArr[0].split("-");
        return dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
    };
}).filter('highlight', ['$sce', function($sce) {
        function addslashes(string) {
            return string.replace(/\\/g, '\\\\').
                    replace(/\u0008/g, '\\b').
                    replace(/\t/g, '\\t').
                    replace(/\n/g, '\\n').
                    replace(/\f/g, '\\f').
                    replace(/\r/g, '\\r').
                    replace(/'/g, '\\\'').
                    replace(/\+/g, '\\+').
                    replace(/\[/g, '\\[').
                    replace(/\]/g, '\\]').
                    replace(/\(/g, '\\(').
                    replace(/\)/g, '\\)').
                    replace(/\./g, '\\.').
                    replace(/"/g, '\\"');
        }
        return function(text, phrase) {
            if (text !== null) {
                if (phrase)
                    phrase = addslashes(phrase);
                text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                        '<span class="highlighted">$1</span>')
                return $sce.trustAsHtml(text)
            } else {
                return text;
            }
        }
    }]);
function htmlDecode(html)
{

    if (null != html)
    {
        html = html.replace(/&amp;/ig, "&");
        html = html.replace(/&quot;/ig, "\"");
        html = html.replace(/&#039;/ig, "'");
        html = html.replace(/&lt;/ig, "<");
        html = html.replace(/&gt;/ig, ">");
    }


    return html;
}