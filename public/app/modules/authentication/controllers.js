'use strict';

angular.module('Authentication')

        .controller('LoginController', ['$scope', 'constants', '$location', 'AuthenticationService', '$route', '$http', '$notification', '$uibModal', 'webserviceFactory', 'storage', '$rootScope', '$interval',
            function($scope, constants, $location, AuthenticationService, $route, $http, $notification, $uibModal, webserviceFactory, storage, $rootScope, $interval) {
                var role = constants.role;
                $rootScope.is_eulaaccepted = 1;

                $scope.fromSignup = 1;

                // reset login status
                AuthenticationService.ClearCredentials();

                AuthenticationService.getYear(function(year) {

                    $scope.currentYear = year;
                    storage.setSession('currentYear', year);

                });


                if (angular.isDefined($route.current.params.user)) {
                    var details = $route.current.params.user;
                    details = details.split(',');
                    $scope.updatepasswordform = {};
                    $scope.updatepasswordform.email = details[0]
                    $scope.updatepasswordform.passtoken = details[1]
                }



                var count = 0;
                $scope.calculateLoginCount = function() {
                    count = count + 1;

                    if (count >= 3) {
                        angular.element('div#googlecaptcha').remove();
                        var el1 = angular.element('div#captcha');
                        el1.html("<div id='googlecaptcha' style='height:60px'></div>")
                        onloadCallback();
                    }

                }
                $scope.login = function() {

                    $scope.error = false;
                    $scope.formValidation = true;
                    if ($scope.fromSignup && $scope.form.$invalid) {
                        $scope.error = ' Email address and password are required';

                    } else {
                        AuthenticationService.Login($scope.username, $scope.password, function(response) {
                            $scope.dataLoading = true;

                            $rootScope.response = response;

                            if (response.status === "success") {
                                var check = $interval(function() {
                                    if (angular.element('#buttonlogin').length > 0) {
                                        $interval.cancel(check);
                                        AuthenticationService.SetCredentials($scope.username, $scope.password, $rootScope.response.data.user.fullname, $rootScope.response);

                                        if (response.data.user.is_eulaaccepted === 1) {
                                            $scope.redirectUser();
                                        } else {
                                            $rootScope.is_eulaaccepted = 0
                                        }
                                    }
                                }, 300);

                            }
                            else {
                                $scope.calculateLoginCount();
                                $scope.error = response.message;

                            }
                            $scope.dataLoading = false;
                        });
                    }
                };
                $scope.redirectUser = function()
                {
                   AuthenticationService.saveAttemptUrl('/');
                    AuthenticationService.redirectToAttemptedUrl();
                    delete $rootScope.response;
                    delete $rootScope.is_eulaaccepted;
                    delete $scope.fromSignup;
                }
                $scope.logout = function()
                {
                    AuthenticationService.ClearCredentials();
                    $location.path('#app/login');

                }
                $scope.acceptEula = function()
                {
                    webserviceFactory.httpRequest($scope, 'accepteula', 'GET', [], {}).then(function(data) {
                        if (data.status == 'success') {
                            $rootScope.globals.currentUser.is_eulaaccepted = data.data === 1;
                            storage.setStorage($rootScope.globals);
                            $scope.redirectUser();
                        }
                    });

                }
                $scope.updatepassword = function(form) {
                    $scope.error = '';
                    $scope.success = '';
                    var successMsg = 'Password updated successfully, please login.';
                    if (form.$valid && $scope.updatepasswordform.password === $scope.updatepasswordform.cpassword) {
                        $scope.dataLoading = true;
                        $http.post('updatepassword', $scope.updatepasswordform)
                                .success(function(response) {
                                    if (response.status != 'success') {
                                        $notification.error('Error', response.message)
                                        $scope.error = response.message;
                                        $scope.formValidation = false;
                                    } else {
                                        $notification.success('Success', successMsg);
                                        $scope.success = successMsg;
                                        $scope.formValidation = false;
                                        $location.path('/login');
                                    }
                                });

                    } else
                    {
                        angular.forEach(form.$error, function(field) {
                            angular.forEach(field, function(errorField) {

                                errorField.$setTouched();
                            })
                        });
                    }
                };
                $scope.forgotpwd = function() {
                    $scope.error = '';
                    $scope.activeModel = $uibModal.open({
                        templateUrl: '/modules/authentication/views/forgetpassword' + constants.htmlFileToUse + '.html',
                        scope: $scope
                    }
                    );
                };
                $scope.cancel = function() {
                    $scope.activeModel.dismiss('cancel');
                }

                $scope.resetpassword = function() {
                    $scope.error = '';
                    $scope.success = '';
                    if ($scope.email == null) {
                        $notification.error('Error', 'Invalid Email')
                    } else {
                        AuthenticationService.Reset($scope.email, function(response) {
                            if (response.status == "success" && response.data.affectedRows > 0) {
                                $scope.success = "Please check your email for login instructions."


                            } else {
                                $scope.error = response.message || "User not found";
                                $scope.formValidation = false;
                            }
                        });
                    }
                };

                $scope.callFormFunc = function(form) {
                    $scope.error = '';
                    if (form.$valid && $scope.signUpData.password === $scope.signUpData.password_c) {
                        $scope.dataLoading = true;

                        AuthenticationService.parentSignUp($scope.signUpData, function(response) {
                            if (response.status !== "success") {
                                $scope.error = response.message;
                                $scope.dataLoading = false;
                            } else {
                                $notification.success('Success', 'User registered successfully.');
                                    $location.path('/');
                            }
                        });
                    } else {
                        $scope.error = '';
                        angular.forEach(form.$error, function(field) {
                            angular.forEach(field, function(errorField) {

                                errorField.$setTouched();
                            })
                        });
                    }
                };


            }]);