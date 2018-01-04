var config = require('./dbconfig');
var connection = config.pool;
var md5 = require('md5');
var express = require('express');
var jwt = require('jsonwebtoken');
var userDAO = require("./DAO/userDAO.js");
var util = require("./util")
var fs = require('fs');

exports.getCurrentYear = function(req, res)
{
    res.send({status: 'success', message: '', data: {year: (new Date()).getFullYear()}});
}
/**
 * @apiErrorExample {json} Error-Response:
 *   {
 "status": "error",
 "message": "Invalid Credentials",
 "data": {}
 }
 * @apiDescription This service is use to authenticate user
 * @api {post} /authenticate Login
 * @apiSampleRequest /authenticate
 * @apiName authUser
 * @apiGroup User
 * @apiParam {String} username  Username.
 * @apiParam {String} password  User's pass.
 * @apiSuccess {String} message Message of the User.
 * @apiSuccess {Object} data  Data of the User.
 * @apiSuccess {String} token Token of the User..
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "jewish",
 *       "password":"jewish"
 *     }
 * @apiSuccessExample {json} Response-Example:
 *     {
 *       {
 "status": "success",
 "message": "",
 "data": {
 "token": "eyJhbGciOiJ",
 "user": {
 "user_type_id": 6,
 "first_name": "Angelina",
 "middle_name": null,
 "last_name": "Macgil",
 "fullname": "Angelina Macgil",
 "allowed_centers": [1,2],
 "user_id": 1,
 "status": "Active",
 "center": "1",
 "pic_name": "profilepic.jpg",
 "shortlist_id": 0,
 "parent_id": 0
 }
 }
 *     }
 *     }
 *     
 */
exports.authUser = function(req, res) {

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {
        userDAO.userAuthDAO(req.body.username, req.body.password, function(data) {
            data.error ? config.logError(data.error, req, res) : res.send(data.value);
        });

    }

};

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use to remove token from user
 * @api {get} /logoutuser Logout
 * @apiSampleRequest /api/logoutuser
 * @apiName logoutUser
 * @apiGroup User
 * @apiSuccess {Object[]} Success
 * @apiSuccessExample {json} Success-Response: 
 * HTTP/1.1 200 OK
 * {
 "status": "success",
 "message": "logout",
 }
 */
exports.logoutUser = function(req, res) {
    connection.query('update dc_user set remember_token=? where user_id=? ', ['', req.decoded.userid], function(err, result) {

        if (err) {
            config.logError(err, req, res);
        } else
        {
            res.send({status: 'success', message: '', data: result});
        }

    });
}
/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription Accept Eula
 * @api {get} /accepteula Accept Eula
 * @apiSampleRequest /api/accepteula
 * @apiName logoutUser
 * @apiGroup User
 * @apiSuccess {Object[]} Success
 * @apiSuccessExample {json} Success-Response: 
 * HTTP/1.1 200 OK
 * {
 "status": "success",
 "message": "",
 "data":1
 }
 */
exports.acceptEula = function(req, res) {

    connection.query('update dc_user set is_eulaaccepted=1, eulaaccepted_date=now() where user_id=? ', [req.decoded.userid], function(err, result) {

        if (err) {
            config.logError(err, req, res);
        } else
        {
            res.send({status: 'success', message: '', data: result.affectedRows});
        }

    });
}

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use for authenticate admin
 * @api {post} /api/authadmin Authenticate Admin
 * @apiSampleRequest /api/authadmin
 * @apiName authenticateAdmin
 * @apiGroup User
 * @apiParam {String} id  User's Id.
 * @apiSuccess {String} message Message of the User.
 * @apiSuccess {Object} data  Data of the User.
 * @apiSuccess {String} data.token Token of the User..
 * @apiParamExample {json} Request-Example:
 *     {
 *       "id": 4,
 *      
 *     }
 * @apiSuccessExample {json} Response-Example:
 {
 "status": "success",
 "message": "",
 "data": {
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1faWQiOjIsInVzZXJpZCI6MTQsImNlbnRlciI6IjI2IiwidXNlcl90eXBlX2lkIjoyLCJwYXJlbnRpZCI6MCwiaWF0IjoxNTAwMjc3MTI1LCJleHAiOjE1MDM4NzcxMjV9.EAfvdDQh8u3K1VWE46czPOVsQUxYPymbKjMUXbysRgU",
 "user": {
 "user_type_id": 2,
 "first_name": null,
 "middle_name": null,
 "last_name": null,
 "fullname": "",
 "user_id": 14,
 "status": "Active",
 "center": "26",
 "pic_name": "1023510235-1.jpg",
 "shortlist_id": 0,
 "parent_id": 0
 },
 "adm_id": 2
 }
 }
 */
exports.authenticateAdmin = function(req, res) {

    req.checkBody('id', 'Id is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {

        var adm_id = (req.decoded.adm_id > 0 ? req.decoded.adm_id : req.decoded.userid);
        if ([config.admin, config.master].indexOf(req.decoded.user_type_id) !== -1 || req.decoded.adm_id > 0) {
            userDAO.authenticateAdminDAO(req.body.id, adm_id, function(data) {
                data.error ? config.logError(data.error, req, res) : res.send(data.value);
            })
        } else
        {
            res.send({status: 'error', message: 'Unauthorized', data: {}});
        }
    }

};

exports.refreshToken = function(req, res) {

    var user = req.body;
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('token', 'Token is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {
        userDAO.refreshTokenDAO(user.username, user.token, function(data) {
            data.error ? config.logError(data.error, req, res) : res.send(data.value);
        })
    }

};

exports.validateToken = function(req, res, token, callback) {

    var userId = req.decoded.adm_id ? req.decoded.adm_id : req.decoded.userid;
    connection.query('SELECT remember_token as token from dc_user du WHERE status="Active" and user_id = ?', [userId], function(err, results) {

        if (err) {
            config.logError(err, req, res);
            callback(false);
        } else {

            if (results != '' && results[0].token != token)
            {

                callback(true);
            } else {

                callback(true);
            }
        }
    });
};

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use to get user detail by id
 * @api {get} /getUserById/id Get User By Id
 * @apiSampleRequest /api/getUserById/:id
 * @apiName getUserById
 * @apiGroup User
 * @apiParam {String} id  User's id
 * @apiParamExample {json} Request-Example:
 *   {"id":18400}
 * @apiSuccessExample {json} Response-Example:  
 *{
 "status": "success",
 "message": "",
 "data": {
 "user_id": 1,
 "first_name": "jack",
 "middle_name": null,
 "last_name": "daniel",
 "email": "jackdaniel@gmail.com",
 "contact_no": "121213333",
 "status": "Active"
 }
 }
 
 */
exports.getUserById = function(req, res) {
    req.checkParams('id', 'User id is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {
       
        var queryParams = [];

        queryParams.push(req.params.id);
       
//allow only those agency whose status = 1 
        connection.query('select * from dc_user where user_id=?', queryParams, function(err, results) {

            if (err) {
                config.logError(err, req, res);
            } else if (results.length > 0) {
               
                    res.send({status: 'success', message: '', data: results[0]});
                


            } else {
                res.send({status: 'error', message: 'Unauthorized', data: {}});
            }

        });
    }
};

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use to get all user
 * @api {get} /getallusers Get User
 * @apiSampleRequest /api/getallusers
 * @apiName getAllUsers
 * @apiGroup User
 * @apiSuccess {Object[]} Array of Users Object.
 
 
 */
exports.getAllUsers = function(req, res) {
    connection.query('select * from dc_user', function(err, results) {

            if (err) {
                config.logError(err, req, res);
            } else if (results.length > 0) {
               
                    res.send({status: 'success', message: '', data: results});


            } else {
                res.send({status: 'error', message: 'Unauthorized', data: {}});
            }


        });
};
function generateRandomString(length, type) {
    var text = "";
    var possible = type == 'D' ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&*";
    var len = possible.length;
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * len));
    return text;
}

/**
 *  * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use to update user detail by administrator
 * @api {post} /updateuserdetails Update User Details
 * @apiSampleRequest /api/updateuserdetails
 * @apiName updateUserDetails
 * @apiGroup User
 *@apiParam {String} user_id   User ID.
 *@apiParam {String} status  Status.
 *@apiParam {String} first_name  First Name.
 *@apiParam {String} last_name  Last Name.
 *@apiParam {String} email  email.
 *@apiParam {String} contact_no Contact No..
 
 *
 * @apiSuccess {Object} success
 
 
 
 */
function changeSecondaryStatus(req, user_id, callback) {
    connection.query('update dc_user set status = ? where user_id = ?', [req.body.status, user_id], function(err, results) {
        if (err) {
            callback(false)
        } else {
            callback(true)
        }
    })
}
exports.updateUserDetails = function(req, res) {
    req.checkBody('user_id', 'User id is required').notEmpty();
    req.checkBody('status', 'Status is required').notEmpty();
    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('last_name', 'Last Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email format is not valid.').isEmail();
//    req.checkBody('user_type_id', 'User Type is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {
        if ([config.admin, config.master].indexOf(req.decoded.user_type_id) !== -1) {
            connection.query('update dc_user set first_name=?,middle_name=?,last_name=?,username=?,email=?,contact_no=?, status=?, updated_at=now() where user_id=?; ', [req.body.first_name,req.body.middle_name, req.body.last_name, req.body.email, req.body.email, req.body.contact_no, req.body.status, req.body.user_id], function(err, results) {
                var message = 'User not found';
                if (err) {
                    config.logError(err, req, res);
                } else {
                   
                        res.send({status: 'success', message: 'Changes saved succefully', data: results[0]});
                    
                }
            });
        } else
        {
            res.send({status: 'error', message: 'You are not authorized to perform this action', data: {}});
        }
    }

};

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use to update user details
 * @api {post} api/updateprofileuserdetails Update Profile User Details
 * @apiSampleRequest /api/updateprofileuserdetails
 * @apiName updateProfileUserDetails
 * @apiGroup User
 *@apiParam {String} firstname   User ID.
 *@apiParam {String} middlename  Middle Name.
 *@apiParam {String} lastname  Status.
 *@apiParam {String} password  First Name.
 *@apiParam {String} username  Last Name.
 *@apiParam {String} file_name  File Name.
 *@apiParam {String} pic_id Pic Id.
 *@apiParam {String} contactno Contact No.
 *
 * @apiSuccess {Object} success
 
 
 
 */
exports.updateProfileUserDetails = function(req, res) {
    req.checkBody('firstname', 'First Name is required').notEmpty();
    req.checkBody('lastname', 'Last Name is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('username', 'Email is not valid').isEmail();
    var errors = req.validationErrors();
    var insQuery = '';
    var password = (req.body.password != '' && req.body.password != '1q2w3e$R') ? "password='" + md5(req.body.password) + "'," : '';
    var query = 'update dc_user set ' + password + 'first_name=?,middle_name=?,last_name=?,contact_no=?, updated_at=now() where user_id=?'
    
    if (errors) {
        res.send({status: 'error', message: errors[0].msg, data: {error: errors}});
    } else {
        connection.query(query, [req.body.firstname, req.body.middlename, req.body.lastname, req.body.contactno, req.decoded.userid], function(err, results) {
            if (err) {
                config.logError(err, req, res);
            } else {
                res.send({status: 'success', message: 'Profile updated successfully.', data: results});
            }

        });
    }
};

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "No token provided."
 }
 * @apiDescription This service is use to update user status
 * @api {post} updateuserstatus Update User Status
 * @apiSampleRequest /api/updateuserstatus
 * @apiName updateUserStatus
 * @apiGroup User
 *
 * @apiParam {String} user_id  User id.
 * @apiParam {String} status  Status.
 *@apiParamExample {json} Request-Example: 
 * {"user_id":2,
 * status:"active"}
 *
 * @apiSuccess {Object} success
 * @apiSuccessExample {json} Response-Example: 
 {
 "status": "success",
 "message": "Changes saved successfully",
 "data": {
 "fieldCount": 0,
 "affectedRows": 1,
 "insertId": 0,
 "serverStatus": 2,
 "warningCount": 0,
 "message": "(Rows matched: 1  Changed: 1  Warnings: 0",
 "protocol41": true,
 "changedRows": 1
 }
 }
 
 
 */
exports.updateUserStatus = function(req, res) {
    req.checkBody('user_id', 'User id is required').notEmpty();
    req.checkBody('status', 'Status is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {
        connection.query('update dc_user set status=?, updated_at=now() where user_id=?', [status, user_id], function(err, results) {
        if (err) {
            status = 'error';
        } else {
            status = 'success';
        }
        callback({data: status, err: err, results: results});
    })
    }
};


/**
 * @api {post} /updatepassword Update Password
 * @apiSampleRequest /api/updatepassword
 * @apiName updatePassword
 * @apiGroup User
 *
 * @apiParam {String} email  email.
 * @apiParam {String} password  password.
 
 *
 * @apiSuccess {Object} success
 
 
 
 */
exports.updatePassword = function(req, res) {
    req.checkBody('email', 'Email address is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('passtoken', 'Token is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {

        connection.query('select status,password from dc_user where email=?', [req.body.email], function(err, results) {
            if (err) {
                config.logError(err, req, res);
            } else {
                if (results.length > 0 && (results[0].status == 'Active' || results[0].status == 'Not Paid') && results[0].password == md5(req.body.passtoken)) {
                    connection.query('update dc_user set password=? where (status="Active" or status="Not Paid") and email=?', [md5(req.body.password), req.body.email], function(err, results) {
                        if (err) {
                            config.logError(err, req, res);
                        } else {
                            var message = '';
                            //var fullUrl = req.protocol + '://' + req.get('host');
                            mailOptions = {
                                to: req.body.email, // list of receivers
                                subject: 'Reset password request', // Subject line
                                html: 'Password changed successfully.'// html body
                            };
                            if (results.affectedRows > 0) {
                                sendEmail(mailOptions);
                            } else
                            {
                                message = 'User not found'
                            }
                            res.send({status: 'success', message: message, data: results});
                        }

                    });
                } else if (results.length > 0 && (results[0].status !== 'Active' || results[0].status !== 'Not Paid'))
                {
                    res.send({status: 'error', message: 'User is ' + results[0].status + ' . Please contact administrator.', data: ''});
                } else if (results.length > 0 && results[0].password != md5(req.body.passtoken))
                {
                    res.send({status: 'error', message: 'Token is expired, please click forget password again.', data: ''});
                } else
                {
                    res.send({status: 'error', message: 'User not found', data: ''});
                }
            }
        });
    }
};

/**
 * @api {post} /resetpassword Request to reset get user's passsword
 * @apiSampleRequest /resetpassword
 * @apiName resetPassword
 * @apiGroup User
 *
 * @apiParam {String} username User's Username.
 * 
 * @apiSuccess {Object} success
 * @apiSuccessExample  {json} Success-Response: 
 * HTTP/1.1 200 OK
 *{"status": "success", "message":{"error":[{"msg":""}]}, "data": {"user_id": 22}}
 
 
 */
exports.resetPassword = function(req, res) {
    req.checkBody('username', 'Email address is required').notEmpty();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: '', data: {error: errors}});
    } else {

        var password = generateRandomString(6);
        connection.query('update dc_user set password=? where (status ="Active" or status = "Not Paid") and (username=? or email=?)', [md5(password), req.body.username, req.body.username], function(err, results) {
            if (err) {
                config.logError(err, req, res);
            } else {
                var message = '';
                var fullUrl = req.protocol + '://' + req.get('host');
                mailOptions = {
                    to: req.body.username, // list of receivers
                    subject: 'Reset password request', // Subject line
                    html: 'Hi,<br>Please <a href="' + fullUrl + '/#app/reset/' + req.body.username + ',' + password + '">click here</a> to reset your password.'// html body
                };
                if (results.affectedRows > 0) {
                    sendEmail(mailOptions);
                } else
                {
                    message = 'User not found'
                }
                res.send({status: 'success', message: message, data: results});
            }

        });
    }
};

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "User Already Exist"
 }
 * @apiDescription This service is use to create user of administrator type
 * @api {post} /parentSignUp Parent Registration
 * @apiSampleRequest /parentSignUp
 * @apiName parentRegistration
 * @apiGroup User
 *@apiParam {String} firstname First Name
 *@apiParam {String} lastname Last Name
 *@apiParam {String} password Password
 *@apiParam {String} username Username
 *@apiParam {String} useremail Email
 *@apiParam {String} contactno Contact No 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "firstname": "jack",
 *       "lastname":"daniel",
 *       "username": "jackdaniel",
 *       "useremail":"abc2gmail.com",
 *       "contactno": "9540049937",
 *       "password":"pass"
 *     }
 *  * @apiSuccess {Object} success Success
 * 
 * @apiSuccessExample {json} Response-Example: 
 {
 "status": "success",
 "message": "",
 "data": {
 "fieldCount": 0,
 "affectedRows": 1,
 "insertId": 0,
 "serverStatus": 2,
 "warningCount": 0,
 "message": "",
 "protocol41": true,
 "changedRows": 0
 }
 }
 
 */
exports.parentRegistration = function(req, res) {
    req.checkBody('username', 'Username/Email is required').notEmpty();
    req.checkBody('firstname', 'First Name is required').notEmpty();
    req.checkBody('lastname', 'Last Name is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('useremail', 'Email is not valid').isEmail();
    // check the validation object for errors
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: errors[0].msg, data: {error: errors}});
    } else {

        connection.query('select user_id from dc_user where (username=? or email=?) and status <> "Invited"', [req.body.username, req.body.useremail], function(err, results) {
            if (results.length != 0)
            {
                res.send({status: 'error', message: 'User already registered', data: {error: errors}});
            } else
            {
                var password = generateRandomString(6);
                connection.query('insert into dc_user (password,username,email,first_name,middle_name,last_name,contact_no,status,created_at) values (?,?,?,?,?,?,?,"Active",now())', [md5(password), req.body.username, req.body.useremail, req.body.firstname, req.body.middlename, req.body.lastname, req.body.contactno], function(err, results) {
                    if (err) {
                        config.logError(err, req, res);
                    } else {
                        if (results.insertId > 0)
                        {
                            connection.query('insert into dc_user_type_mapping (user_id,user_type_id) values (?,' + config.client + ')', [results.insertId], function(err, results) {
                                if (err) {
                                    config.logError(err, req, res);
                                    res.send({status: 'error', message: "User type error", data: {error: errors}});
                                } else {
                                    var message = '';
                                    mailOptions = {
                                        to: req.body.useremail, // list of receivers
                                        subject: 'Registration Success', // Subject line
                                        text: 'Successfully registered', // plaintext body
                                        html: 'Thanks for registration.'// html body
                                    };
                                    if (results.affectedRows > 0) {
                                        sendEmail(mailOptions);
                                    } else
                                    {
                                        message = 'Please try again';
                                    }
                                }


                                res.send({status: 'success', message: message, data: results});
                            });
                        }
                    }
                });
            }
        });
    }
};

exports.sendEmail = function(req, res) {
    sendEmail(req);
}
exports.sendErrorEmail = function(err, url) {
    var mailOptions = {
        to: 'test@test.com',
        subject: "Exception - URL:" + url,
        html: 'Hi , <br/>   ' + JSON.stringify(err)
    };
    console.log(mailOptions);
    sendEmail(mailOptions);
}
function sendEmail(mailOptions, callback) {
    var nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(util.email.url);
    
    // setup e-mail data with unicode symbols
    if (typeof mailOptions == 'undefined') {
        mailOptions = {
            from: util.email.fromEmail, // sender address
            to: '', // list of receivers
            subject: 'Subject', // Subject line
            html: 'Please contact administrator' + emailContactSignature // html body
        };
    }
    console.log(mailOptions)
    if (config.env === 'local' || mailOptions.subject.indexOf('localhost') > -1)
    {
        return;
    } else
    {

        mailOptions.from = mailOptions.from ? mailOptions.from : fromEmail;
        mailOptions.html = mailOptions.html + emailSignature();
        //  mailOptions.text = (typeof mailOptions.text != 'undefined' ? mailOptions.text : '') + emailSignature();

// send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info) {

            
            console.log('Message sent: ' + info.response);

            connection.query("insert into dc_email_sent(send_by,send_to,message,subject,at) values(?,?,?,?,now())", [mailOptions.from, mailOptions.to, mailOptions.html, mailOptions.subject], function(err, result) {

                if (err) {

                    if (typeof (callback) !== 'undefined') {
                        callback(err);
                    }
                    return console.log(err);
                }
            })
            if (typeof (callback) !== 'undefined') {
                callback(true);
            }
        });
    }
}
function emailSignature() {
    return '<br><br>Sincerely,<br>The My Project Team';
}
function emailContactSignature() {
    return '<br><br>If you have any questions, please contact us at (xxx) xxx-xxxx';
}
exports.generateRandomString = function(range) {
    return generateRandomString(range);
}

/**
 * @apiErrorExample {json} Error-Response:
 *  Error 403: Forbidden
 {
 "status": "error",
 "message": "Invalid Credentials",
 "data": {}
 }
 * @apiDescription This service is use to re-invite user
 * @api {post} /api/reinviteuser Re-Invite User
 * @apiSampleRequest /api/reinviteuser
 * @apiName reInviteUser
 * @apiGroup User
 *@apiParam {String} userId user Id.
 @apiParamExample {json} Request-Example:
 *     {
 *       "userId": "1",
 *     }
 *  * @apiSuccess {Object} success
 * 
 * @apiSuccess {Object} success
 * @apiSuccessExample {json} Response-Example: 
 {"status":"success","message":"","data":{"data":{},"count":[{"cnt":0}]}}
 
 
 
 */
exports.reInviteUser = function(req, res) {
    req.checkBody('userId', 'User Id is  required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.send({status: 'error', message: errors[0].msg, data: {}});
    } else {
        connection.query("select ifnull(du.first_name,'') as first_name,ifnull(du.last_name,'') as last_name,du.status,du.email as email,dutm.user_type_id,dac.center_id,du.otp as otp from dc_user du inner join dc_user_type_mapping dutm on du.user_id=dutm.user_id inner join dc_user_agencies dac on dac.user_id=du.user_id where du.user_id = ? ", [req.body.userId], function(err, results) {
            if (err) {
                config.logError(err, req, res);
            } else {
                if (results[0] && results[0].status) {
                    switch (results[0].status) {
                        case 'Invited':
                            req.body.center_id = results[0].center_id;
                            req.body.type = results[0].user_type_id;
                            sendEmail(accountRegistrationEmail(results[0].email, results[0].first_name, results[0].last_name, req, '', results[0].otp));
                            res.send({status: 'success', message: 'User invited successfully.', data: results});
                            break;

                        case 'Active':
                            res.send({status: 'error', message: 'User is already registered', data: {}});
                            break;
                        case 'Archived':
                            res.send({status: 'error', message: 'User is Archived', data: {}});
                            break;
                        case 'Not Paid':
                            res.send({status: 'error', message: 'User is registered but has not paid fee', data: {}});
                            break;
                    }
                } else {
                    res.send({status: 'error', message: 'This user is not invited', data: {}});
                }

            }

        });
    }

};