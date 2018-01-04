
var config = require('../dbconfig');
var connection = config.pool;
var md5 = require('md5');
var express = require('express');
var jwt = require('jsonwebtoken');
var util = require('../util')
module.exports = {
    userAuthDAO: function(username, password, callback) {

        a = connection.query('SELECT  * from dc_user WHERE STATUS != "Archived" and  email=? and password = md5(?) limit 1', [ username, password], function(err, results) {
            if (err) {

                callback({error: err});
            } else {

                if (results != '')
                {
                   
                    var token = jwt.sign({userid: results[0].user_id}, util.superSecret, {expiresIn: 43200});
                    connection.query('update dc_user set last_login = now(), remember_token=? where user_id=? ', [token, results[0].user_id], function(err, result) {
                        if (err) {
                            callback({error: err});
                        } else {
                            callback({value: {status: 'success', message: '', data: {token: token, user: results[0]}}});
                        }

                    });

                }else
                {

                    callback({value: {status: 'error', message: 'Username or password is incorrect', data: {}}});
                }
            }
        });
    },
   
}

