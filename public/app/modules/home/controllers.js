'use strict';
angular.module('Home').controller('FooterController', ['$scope', '$rootScope', 'storage', function($scope, $rootScope, storage) {
        $scope.display = false;
        $scope.$on('$routeChangeSuccess', function() {
            if (!$rootScope.globals.currentUser) {
                $scope.display = false;
            } else {
                $scope.currentYear = storage.getSessionValue('currentYear');
                $scope.display = true;
            }
        });
        $scope.scrollToTop = function() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }

    }]) .controller('HomeController', ['$scope', '$http', '$filter', '$rootScope', '$route', 'init', '$timeout', '$interval', '$uibModal', 'myService', '$notification', '$location', 'webserviceFactory', 'constants', '$routeParams', '$anchorScroll', '$sce', 'storage', function($scope, $http, $filter, $rootScope, $route, init, $timeout, $interval, $uibModal, myService, $notification, $location, webserviceFactory,  constants, $routeParams, $anchorScroll, $sce, storage) {    }]);
