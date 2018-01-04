var https = require('https');
var app = require('./routes/util');
var multer = require('multer');
var cookie = require('cookie');
var fs = require('fs');
var config = require('./routes/dbconfig');
var application = app.app;
var path = require('path');
var http = require('http');
var apprequest = require('request');
var md5 = require('md5');
users = require('./routes/users');
apidoc = require('./routes/apidocs');

var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var fse = require('fs-extra');
var healthCheck = require('./routes/serverhealthcheck')

application.set('superSecret', 'myproject');
application.set('port', process.env.PORT || 3000);
application.disable('x-powered-by');


application.use(app.express.static(path.join(__dirname, 'public/app')));

application.use(bodyParser.json({limit: "50mb"}));  // parse application/json
//application.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
application.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));
application.use(expressValidator());
//application.use(multer()); // for parsing multipart/form-data
/*
 application.all('/*', function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "X-Requested-With");
 next();
 });
 */

var apiRoutes = app.express.Router();

application.get('/api/getcurrentyear', users.getCurrentYear);
application.post('/authenticate', users.authUser);
application.post('/resetpassword', users.resetPassword);
application.post('/updatepassword', users.updatePassword);

application.post('/api/refreshtoken', users.refreshToken);
application.post('/apidocauthenticate', apidoc.apidocAuth);

application.post('/checkmysql', healthCheck.checkMysql);
application.post('/checkmongo', healthCheck.checkMongo);
application.post('/healthcheckauthenticate', healthCheck.healthCheckAuth);
application.post('/checkspace', healthCheck.checkDiskSpace);


// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, application.get('superSecret'), function(err, decoded) {
            if (err) {

                return res.send({status: 'error', message: 'login', data: {}});
            } else {

                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
//                var isTokenValid=users.validateToken(req, res);
                users.validateToken(req, res, token, function(val) {
                    if (val)
                    {
                        if (req.path != '/') {
                           
                        } else {
                            res.send({status: 'error', message: 'Unauthorized', data: {}});
                        }
                    }

                });


            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            status: 'error',
            message: 'No token provided.'
        });

    }
});
apiRoutes.get('/logoutuser', users.logoutUser);
//apiRoutes.post('/updatelastlogin', userdetails.updateLastLogin);

apiRoutes.get('/accepteula', users.acceptEula);
apiRoutes.post('/updateuserstatus', users.updateUserStatus);
apiRoutes.post('/updateuserdetails', users.updateUserDetails);
apiRoutes.post('/reinviteuser', users.reInviteUser);
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dir = 'public/app/images/useruploads/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        dir = 'public/app/images/useruploads/' + (req.params.id ? req.params.id : req.decoded.userid) + '/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, 'tempprofilepic.jpg');
    }
});
// apply the routes to our application with the prefix /api
application.use('/api', apiRoutes);
application.use(function(req, res) {

    res.status(404).send('<img src="/images/404.png" alt="Page not found."/>');
});

// Handle 500
application.use(function(err, req, res, next) {
    users.sendErrorEmail(err.stack, req.protocol + '://' + req.get('host') + req.originalUrl);
    res.status(500).send({status: 'error', message: 'Something went wrong, please try again', data: {}});
});

if (config.env === "local") {
    var httpsServer = application.listen(application.get('port'), function() {
        console.log("Express server listening on port " + application.get('port'));

    });
}
else {
//if you want to use https you can add certificate files in a folder and can use like this
    var options = {
        ca: fs.readFileSync("ssl/test.ca-bundle"),
        key: fs.readFileSync('ssl/test.key'),
        cert: fs.readFileSync('ssl/test.crt')
    };

    var httpsServer = https.createServer(options, application);

    httpsServer.listen(443);

}
