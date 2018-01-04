'use strict';

angular.module('Common').
directive('notifications', ['$notification', '$compile', function($notification, $compile) {
    /**
     *
     * It should also parse the arguments passed to it that specify
     * its position on the screen like "bottom right" and apply those
     * positions as a class to the container element
     *
     * Finally, the directive should have its own controller for
     * handling all of the notifications from the notification service
     */
//                console.log('this is a new directive');
    var html =
        '<div class="dr-notification-wrapper" ng-repeat="noti in queue">' +
        '<div class="dr-notification-close-btn" ng-click="removeNotification(noti)">' +
        '<i class="fa fa-remove"></i>' +
        '</div>' +
        '<div class="dr-notification">' +
        '<div class="dr-notification-image dr-notification-type-{{noti.type}}" ng-switch on="noti.image">' +
        '<i class="fa fa-{{noti.icon}}" ng-switch-when="false"></i>' +
        '<img ng-src="{{noti.image}}" ng-switch-default />' +
        '</div>' +
        '<div class="dr-notification-content">' +
        '<h3 class="dr-notification-title">{{noti.title}}</h3>' +
        '<p class="dr-notification-text">{{noti.content}}</p>' +
        '</div>' +
        '</div>' +
        '</div>';


    function link(scope, element, attrs) {
        var position = attrs.notifications;
        position = position.split(' ');
        element.addClass('dr-notification-container');
        for (var i = 0; i < position.length; i++) {
            element.addClass(position[i]);
        }
    }


    return {
        restrict: 'A',
        scope: {},
        template: html,
        link: link,
        controller: ['$scope', function NotificationsCtrl($scope) {
            $scope.queue = $notification.getQueue();

            $scope.removeNotification = function(noti) {
                $scope.queue.splice($scope.queue.indexOf(noti), 1);
            };
        }
        ]

    };
}])
    .directive('positiveNumber', function() {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function(val) {
                var _val = '';
                _val = val;
                var clean = _val.toString().replace(/[^0-9]+/g, '');
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function(event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
}).directive('stringToNumber', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value);
            });
        }
    };
}).directive('capitalizeFirst', [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {

            function parser(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }
                var formatedValue = formatValue(value);
                if (ctrl.$viewValue !== formatedValue) {
                    ctrl.$setViewValue(formatedValue);
                    ctrl.$render();
                }
                return formatedValue;
            }

            function formatter(value) {
                if (ctrl.$isEmpty(value)) {
                    return value;
                }
                var formatedValue = formatValue(value);
                return formatedValue;
            }

            function formatValue(value) {
                var splitStr = value.toLowerCase().split(' ');
                for (var i = 0; i < splitStr.length; i++) {
                    splitStr[i] = capitalizeString(splitStr[i]);
                }
                var formatedValue = splitStr.toString().replace(/,/g, ' ');
                return formatedValue;
            }

            function capitalizeString(inputString) {
                return inputString.substring(0, 1).toUpperCase() + inputString.substring(1);
            }


            ctrl.$formatters.push(formatter);
            ctrl.$parsers.push(parser);
        }
    };
}
]).directive('radioFocus', ['$timeout', function ($timeout) {
        return {
            name: 'radioFocus',
            restrict: 'A',
            link: function (scope, element, attrs) {
                                $timeout(function () {
                element.find('label.radio-inline.control.control-radio').each(function (ind, elem) {
                    elem = angular.element(elem);
                    elem.attr('tabindex', '0');
                    var child = elem.children().first();
                    child.attr('tabindex', '-1');
                    elem.bind('keypress', function () {
                        event.preventDefault();
                        if (event.which === 32) {
                            child.trigger('click').click();
                        }
                    });

                });
                });
            }
        }
    }]).directive('checkboxFocus', ['$timeout', function ($timeout) {
        return {
            name: 'checkboxFocus',
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    element.find('span.label__text').each(function (ind, elem) {
                        elem = angular.element(elem);
                        elem.attr('tabindex', '0');
                        var child = elem.parent().children().first();
                        child.attr('tabindex', '-1');
                        elem.unbind('keypress');
                        elem.bind('keypress', function () {
                            event.preventDefault();
                            if (event.which === 32) {
                                child.trigger('click');
                            }
                        });
                    });
                },1000);
            }
        }
    }]);