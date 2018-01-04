'use strict';

angular.module('Common').value('redirectToUrlAfterLogin', {url: '/'})
    .constant("constants", {
        "sessiontime": 3600000, 
        "htmlFileToUse": ".min",
        "maxImageSize": 5242880,
        "role": {"client": 3, "admin": 2, "master": 1},
        
    });