'use strict';

var _data = '';
var fileReader = function($q, $log) {

    var onLoad = function(reader, deferred, scope) {
        return function() {
            scope.$apply(function() {
                deferred.resolve(reader.result);
            });
        };
    };

    var onError = function(reader, deferred, scope) {
        return function() {
            scope.$apply(function() {
                deferred.reject(reader.result);
            });
        };
    };

    var onProgress = function(reader, scope) {
        return function(event) {
            scope.$broadcast("fileProgress",
                {
                    total: event.total,
                    loaded: event.loaded
                });
        };
    };

    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };

    var readAsDataURL = function(file, scope) {
        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);

        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL
    };
};
angular.module('Common').
factory('$notification', ['$timeout', function($timeout) {

    // console.log('notification service online');
    var notifications = JSON.parse(localStorage.getItem('$notifications')) || [],
        queue = [];

    var settings = {
        info: {duration: 5000, enabled: true},
        warning: {duration: 5000, enabled: true},
        error: {duration: 5000, enabled: true},
        success: {duration: 5000, enabled: true},
        progress: {duration: 0, enabled: true},
        custom: {duration: 35000, enabled: true},
        details: true,
        localStorage: false,
        html5Mode: false,
        html5DefaultIcon: 'icon.png'
    };




    return {
        /* ========== SETTINGS RELATED METHODS =============*/

        disableHtml5Mode: function() {
            settings.html5Mode = false;
        },
        disableType: function(notificationType) {
            settings[notificationType].enabled = false;
        },
        enableHtml5Mode: function() {
            // settings.html5Mode = true;
            settings.html5Mode = this.requestHtml5ModePermissions();
        },
        enableType: function(notificationType) {
            settings[notificationType].enabled = true;
        },
        getSettings: function() {
            return settings;
        },
        toggleType: function(notificationType) {
            settings[notificationType].enabled = !settings[notificationType].enabled;
        },
        toggleHtml5Mode: function() {
            settings.html5Mode = !settings.html5Mode;
        },
        /* ============ QUERYING RELATED METHODS ============*/

        getAll: function() {
            // Returns all notifications that are currently stored
            return notifications;
        },
        getQueue: function() {
            return queue;
        },
        /* ============== NOTIFICATION METHODS ==============*/

        info: function(title, content, userData) {
            // console.log(title, content);
            return this.awesomeNotify('info', 'info', title, content, userData);
        },
        error: function(title, content, userData) {
            return this.awesomeNotify('error', 'remove', title, content, userData);
        },
        success: function(title, content, userData) {
            return this.awesomeNotify('success', 'check', title, content, userData);
        },
        warning: function(title, content, userData) {
            return this.awesomeNotify('warning', 'exclamation', title, content, userData);
        },
        awesomeNotify: function(type, icon, title, content, userData) {
            /**
             * Supposed to wrap the makeNotification method for drawing icons using font-awesome
             * rather than an image.
             *
             * Need to find out how I'm going to make the API take either an image
             * resource, or a font-awesome icon and then display either of them.
             * Also should probably provide some bits of color, could do the coloring
             * through classes.
             */
            // image = '<i class="icon-' + image + '"></i>';
            return this.makeNotification(type, false, icon, title, content, userData);
        },
        notify: function(image, title, content, userData) {
            // Wraps the makeNotification method for displaying notifications with images
            // rather than icons
            return this.makeNotification('custom', image, true, title, content, userData);
        },
        makeNotification: function(type, image, icon, title, content, userData) {
            var notification = {
                'type': type,
                'image': image,
                'icon': icon,
                'title': title,
                'content': content,
                'timestamp': +new Date(),
                'userData': userData
            };
            notifications.push(notification);

            if (settings.html5Mode) {
                html5Notify(image, title, content, function() {
//            console.log("inner on display function");
                }, function() {
//            console.log("inner on close function");
                });
            } else {
                queue.push(notification);
                $timeout(function removeFromQueueTimeout() {
                    queue.splice(queue.indexOf(notification), 1);
                }, settings[type].duration);

            }

            this.save();
            return notification;
        },
        /* ============ PERSISTENCE METHODS ============ */

        save: function() {
            // Save all the notifications into localStorage
            // console.log(JSON);
            if (settings.localStorage) {
                localStorage.setItem('$notifications', JSON.stringify(notifications));
            }
            // console.log(localStorage.getItem('$notifications'));
        },
        restore: function() {
            // Load all notifications from localStorage
        },
        clear: function() {
            notifications = [];
            this.save();
        }

    };
}]).
factory('webserviceFactory', ['$http', '$notification', '$rootScope', '$location', 'constants', 'storage', function($http, $notification, $rootScope, $location, constants, storage) {


    var myService = {
        httpRequest: function(scope, url, method, params, postData, upload) {
            storage.setCookie($rootScope.globals.currentUser.token);
            var data = {};

            data.url = '/api/' + url + '?q=' + new Date().getTime();


            data.method = angular.isUndefined(method) ? 'GET' : method;

            if (angular.isDefined(method)) {
                data.params = params;
            }

            if (angular.isDefined(postData)) {
                data.data = postData;
            }

            if (angular.isDefined(upload)) {
                data.upload = upload;
            }

            if (angular.isDefined($rootScope.globals) && $rootScope.globals.currentUser) {

                $http.defaults.headers.common['x-access-token'] = $rootScope.globals.currentUser.token; // jshint ignore:line
            }
            var promise = $http(data).then(function(response) {

                if (angular.isString(response.data) && response.data != 1) {
                    if (response.data.substr('loginMark')) {
                        //location.reload();
                        return;
                    }
                    $notification.info('siteName', 'content');

                    return false;
                }
                if (data.method != 'GET' && response.data.message != '' && response.data.status === 'success' && ((response.data.data.length > 0 ? response.data.data[response.data.data.length - 1].affectedRows : response.data.data.affectedRows) > 0)) {
                    $notification.success('Success', response.data.message);

                } else if (response.data.status === 'error') {
                    if (response.data.message == 'Failed to authenticate token.')
                    {
                        $notification.error('Error', response.data.message);
                        scope.showLoginModal();
                    }
                   if (response.data.message == 'Unauthorized')
                    {
                        $location.path('/unauthorize');
                    } else if (response.data.message === 'login')
                    {
                        if ($location.path() !== '/login') {
                            $notification.error('Error', 'Session Expired');
                            response.data.message = 'Session Expired';
                            $location.path('/login');
                           
                        }
                    }  else {
                        $notification.error('Error', response.data.message);
                    }

                } else if (data.method == 'GET' && response.data.status === 'error')
                {
                    $notification.error('Error', 'Some error happened, please try again!');
                }
//                    else
//                    {
//                        $notification.error('Error', 'Some error happened, please try again!');
//                    }
                return response.data;
            }, function(response) {
                var http_codes = {
                    100: 'Continue',
                    101: 'Switching Protocols',
                    102: 'Processing',
                    200: 'OK',
                    201: 'Created',
                    202: 'Accepted',
                    203: 'Non-Authoritative Information',
                    204: 'No Content',
                    205: 'Reset Content',
                    206: 'Partial Content',
                    207: 'Multi-Status',
                    300: 'Multiple Choices',
                    301: 'Moved Permanently',
                    302: 'Found',
                    303: 'See Other',
                    304: 'Not Modified',
                    305: 'Use Proxy',
                    306: 'Switch Proxy',
                    307: 'Temporary Redirect',
                    400: 'Bad Request',
                    401: 'Unauthorized',
                    402: 'Payment Required',
                    403: 'Forbidden',
                    404: 'Not Found',
                    405: 'Method Not Allowed',
                    406: 'Not Acceptable',
                    407: 'Proxy Authentication Required',
                    408: 'Request Timeout',
                    409: 'Conflict',
                    410: 'Gone',
                    411: 'Length Required',
                    412: 'Precondition Failed',
                    413: 'Request Entity Too Large',
                    414: 'Request-URI Too Long',
                    415: 'Unsupported Media Type',
                    416: 'Requested Range Not Satisfiable',
                    417: 'Expectation Failed',
                    418: 'I\'m a teapot',
                    422: 'Unprocessable Entity',
                    423: 'Locked',
                    424: 'Failed Dependency',
                    425: 'Unordered Collection',
                    426: 'Upgrade Required',
                    449: 'Retry With',
                    450: 'Blocked by Windows Parental Controls',
                    500: 'Internal Server Error',
                    501: 'Not Implemented',
                    502: 'Bad Gateway',
                    503: 'Service Unavailable',
                    504: 'Gateway Timeout',
                    505: 'HTTP Version Not Supported',
                    506: 'Variant Also Negotiates',
                    507: 'Insufficient Storage',
                    509: 'Bandwidth Limit Exceeded',
                    510: 'Not Extended'
                };
                if (response.data.message == 'No token provided.')
                {
                    storage.removeAllSession();
                    $location.path('/login');
                } else {
                    $notification.error(http_codes[response.status], 'An error occured while processing your request.');
                    if (response.status == 401)
                        scope.showLoginModal();
                }
            });

            return promise;
        }
    };
    return myService;
}]).
factory('fileReader', ['$q', '$log', fileReader]).
factory('storage', ['$window', '$cookies', 'constants', function($window, $cookies, constants) {

    function expireDate() {
        return new Date(Date.now() + constants.sessiontime);
    }
    var maxAge = constants.sessiontime;
    return{
        setStorage: function(global) {
            $cookies.put('token', global.currentUser.token, {'expires': expireDate(), 'maxAge': maxAge});
            var storage = angular.copy(global);
            delete storage.currentUser['token'];
            if ($window.localStorage) {
                $window.localStorage.setItem('globals', btoa(JSON.stringify(storage)));
            } else {
                $cookies.put('globals', btoa(JSON.stringify(storage)), {'expires': expireDate(), 'maxAge': maxAge});
            }
        },
        setCookie: function(value) {
            $cookies.put('token', value, {'expires': expireDate(), 'maxAge': maxAge});
        },
        setSession: function(key, value) {
//                        $window.sessionStorage.setItem(key, value);
            if ($window.localStorage) {
                $window.localStorage.setItem(key, btoa(value));
            } else {
                $cookies.put(key, btoa(value), {'expires': expireDate(), 'maxAge': maxAge});
            }
        },
        getSessionValue: function(key) {
//                        return $window.sessionStorage.getItem(key) || '{}';
            if ($window.localStorage) {
                var temp = $window.localStorage.getItem(key);
                if (temp) {

                    return atob(temp);
                } else {
                    return '{}';
                }
            } else {
                var temp = $cookies.get(key);
                if (temp) {
                    return atob(temp);
                } else {
                    return '{}';
                }
            }
        },
        getCookieValue: function(key) {
            return $cookies.get(key) || '';
        },
        removeSessionValue: function(key) {
            if ($window.localStorage) {
                $window.localStorage.removeItem(key);
            } else {
                $cookies.remove(key);
            }
        },
        removeAllSession: function() {
            if ($window.localStorage) {
                $window.localStorage.clear();
            } else {
                var cookies = $cookies.getAll();
                angular.forEach(cookies, function(v, k) {
                    $cookies.remove(k);
                });
            }
        }
    }
}]);
