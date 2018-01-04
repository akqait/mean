'use strict';

angular.module('Authentication')

        .factory('AuthenticationService',
                ['Base64', '$http', '$cookies', '$rootScope', '$timeout', '$location', 'redirectToUrlAfterLogin', 'constants', 'storage',
                    function(Base64, $http, $cookies, $rootScope, $timeout, $location, redirectToUrlAfterLogin, constants, storage) {
                        var service = {};
                        service.getYear = function(callback) {

                            $http.get('/api/getcurrentyear/')
                                    .success(function(data) {
                                        callback(data.data.year);
                                    });


                        }
                        service.saveAttemptUrl = function(val) {
                            if (angular.isDefined(val)) {
                                redirectToUrlAfterLogin.url = val;
                            } else if ($location.path().toLowerCase() != '/login') {
                                redirectToUrlAfterLogin.url = $location.path();
                            } else {
                                redirectToUrlAfterLogin.url = '/';
                            }

                        }
                        service.redirectToAttemptedUrl = function() {

                            $location.path(redirectToUrlAfterLogin.url);
                        }
                        service.Login = function(username, password, callback) {
                            storage.removeSessionValue('searchData');

                            /* Use this for real authentication
                             ----------------------------------------------*/
                            $http.defaults.headers.common.Authorization = 'Basic';
                            $http.post('authenticate', {username: username, password: password})
                                    .success(function(response) {
                                        if (response.status != 'success') {
//                                            response.message = 'Username or password is incorrect';
                                            callback(response);
                                        } else if (response.data.token) {
                                            $http.defaults.headers.common['x-access-token'] = response.data.token;
											
                                            callback(response);
                                        } else {
										
                                            callback(response);
                                        }
                                    });


                        };
                        service.adminAuth = function(id, callback) {
                           
                            /* Use this for real authentication
                             ----------------------------------------------*/
                            $http.defaults.headers.common.Authorization = 'Basic';
                            $http.post('api/authadmin', {id: id})
                                    .success(function(response) {
                                        if (response.status != 'success' || response.data.user.center == null) {
                                            //  response.message = 'Username or password is incorrect';
                                            callback(response);
                                        } else {
                                            callback(response);
                                        }
                                    });


                        };

                        service.parentSignUp = function(formData, callback) {

                            $http.defaults.headers.common.Authorization = 'Basic';
                            $http.post('/userregistration', formData)
                                    .success(function(response) {
                                        callback(response);
                                    });


                        };

                        service.Reset = function(username, callback) {


                            $http.post('resetpassword', {username: username})
                                    .success(function(response) {
                                        if (response.status != 'success') {
                                            response.message = 'Username or password is incorrect';
                                        }
                                        callback(response);
                                    });


                        };

                        service.SetCredentials = function(username, password, fullname, response) {
                            var authdata = Base64.encode(username + ':' + password);
                            $rootScope.globals = {
                                currentUser: {
                                    username: username,
                                    authdata: authdata,
                                    token: response.data.token,
                                    user_type_id: response.data.user.user_type_id,
                                    pic_name: 'useruploads/' + response.data.user.user_id + '/profilepic.jpg?' + Math.random(),
                                    fullname: fullname,
                                    userid: response.data.user.user_id,
                                    status: response.data.user.status,
                                    is_eulaaccepted: response.data.user.is_eulaaccepted,
                                    last_login: response.data.user.last_login

                                }

                            };
                           
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
                            $http.defaults.headers.common['x-access-token'] = response.token;

                            storage.setStorage($rootScope.globals);
                        };

                        service.ClearCredentials = function() {
                            $rootScope.globals = {};
                            $rootScope.isCssLoaded = false;
                            storage.removeAllSession();
                            $http.defaults.headers.common.Authorization = 'Basic ';

                        };
                        service.logoutuser = function() {
                            $http.get('api/logoutuser')
                                    .success(function(response) {

                                    });
                        };
                       


                        return service;
                    }])

        .factory('Base64', function() {
            /* jshint ignore:start */

            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

            return {
                encode: function(input) {
                    var output = "";
                    var chr1, chr2, chr3 = "";
                    var enc1, enc2, enc3, enc4 = "";
                    var i = 0;

                    do {
                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);

                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;

                        if (isNaN(chr2)) {
                            enc3 = enc4 = 64;
                        } else if (isNaN(chr3)) {
                            enc4 = 64;
                        }

                        output = output +
                                keyStr.charAt(enc1) +
                                keyStr.charAt(enc2) +
                                keyStr.charAt(enc3) +
                                keyStr.charAt(enc4);
                        chr1 = chr2 = chr3 = "";
                        enc1 = enc2 = enc3 = enc4 = "";
                    } while (i < input.length);

                    return output;
                },
                decode: function(input) {
                    var output = "";
                    var chr1, chr2, chr3 = "";
                    var enc1, enc2, enc3, enc4 = "";
                    var i = 0;

                    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                    var base64test = /[^A-Za-z0-9\+\/\=]/g;
                    if (base64test.exec(input)) {
                        window.alert("There were invalid base64 characters in the input text.\n" +
                                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                                "Expect errors in decoding.");
                    }
                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                    do {
                        enc1 = keyStr.indexOf(input.charAt(i++));
                        enc2 = keyStr.indexOf(input.charAt(i++));
                        enc3 = keyStr.indexOf(input.charAt(i++));
                        enc4 = keyStr.indexOf(input.charAt(i++));

                        chr1 = (enc1 << 2) | (enc2 >> 4);
                        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                        chr3 = ((enc3 & 3) << 6) | enc4;

                        output = output + String.fromCharCode(chr1);

                        if (enc3 != 64) {
                            output = output + String.fromCharCode(chr2);
                        }
                        if (enc4 != 64) {
                            output = output + String.fromCharCode(chr3);
                        }

                        chr1 = chr2 = chr3 = "";
                        enc1 = enc2 = enc3 = enc4 = "";

                    } while (i < input.length);

                    return output;
                }
            };

            /* jshint ignore:end */
        });
