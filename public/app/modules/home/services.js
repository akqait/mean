'use strict';

angular.module('Home')
        .factory('myService', function() {
            var myService = {
                
                "imageFolder": "/compress/"
            };
            return myService;
        })