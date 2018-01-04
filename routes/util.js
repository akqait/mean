var express = require('express');

function twoDigits(d) {
    if (0 <= d && d < 10)
        return "0" + d.toString();
    if (-10 < d && d < 0)
        return "-0" + (-1 * d).toString();
    return d.toString();
}

function toMysqlFormat(date) {
    return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate()) + " " + twoDigits(date.getUTCHours()) + ":" + twoDigits(date.getUTCMinutes()) + ":" + twoDigits(date.getUTCSeconds());
}


module.exports = {
    app: express(),
    express: express,
    superSecret: "superkey",
    apidocPass: "apidocPass",
    appTitle: "My Project",
    healthCheckUsername: 'healthCheckUsername',
    healthCheckPassword: 'healthCheckPassword',
    maxImageSize: 5242880,
    maxVideoSize: 524288000,
	email:{url:'smtps://test@gmailtest.com:password@smtp.gmail.com',fromEmail : '"My Email Name " <test@gmailtest.com>'}
   
};