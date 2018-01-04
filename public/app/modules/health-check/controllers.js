'use strict';

angular.module('ServerHealthCheck')

        .controller('ServerHealthCheckController', ['$scope', '$http', function($scope, $http) {
                $scope.loggedin = false;
                $scope.healthCheckLogin = function() {
                    $http.post('healthcheckauthenticate', {username: $scope.username, password: $scope.password})
                            .success(function(response) {
                                if (response.status) {

                                    if (response.status === 'success') {
                                        $scope.loggedin = true;
                                        $scope.loginError = "";
                                        $scope.checkMysql();
                                        $scope.checkMongo();
                                        $scope.checkDiskSpace();
                                        $scope.checkPhpServer();
                                    } else {
                                        $scope.loginError = "Invalid username or password"
                                    }

                                }
                            })
                }
                $scope.checkMysql = function() {
                    $http.post('checkmysql', {username: $scope.username, password: $scope.password})
                            .success(function(response) {
                                if (response.status) {
                                    if (response.status === 'success') {
                                        $scope.mysqlStatus = 'Connected';
                                    } else {
                                        if (response.message === 'Unauthorized') {
                                            $scope.error = 'You are not allowed to perform this action';
                                        } else {
                                            $scope.mysqlStatus = 'Not Connected';
                                        }
                                    }
                                }
                            })

                };
                $scope.checkMongo = function() {
                    $http.post('checkmongo', {username: $scope.username, password: $scope.password})
                            .success(function(response) {
                                if (response.status) {
                                    if (response.status === 'success') {
                                        $scope.mongoStatus = 'Connected';
                                    } else {
                                        if (response.message === 'Unauthorized') {
                                            $scope.error = 'You are not allowed to perform this action';
                                        } else {
                                            $scope.mongoStatus = 'Not Connected';
                                        }
                                    }

                                }
                            })

                };
                $scope.checkDiskSpace = function() {
                    $http.post('checkspace', {username: $scope.username, password: $scope.password})
                            .success(function(response) {

                                if (response.status === 'success') {
                                    $scope.diskSpace = response.data.data;
                                } else {
                                    if (response.message === 'Unauthorized') {
                                        $scope.error = 'You are not allowed to perform this action';
                                    } else {
                                        $scope.diskSpaceError = 'Not calculated';
                                    }
                                }


                            })

                };
                



            }]);

