var mysql = require('mysql');
var logger = require('./log');
var pool;
var currentHostURL;
const env = 'local'; //dev, local, prod
        if (env === "local"){
//localhost
    currentHostURL = "http://localhost:3000";
pool = mysql.createPool({
connectionLimit: 30,
        waitForConnections: true,
        queueLimit: 0,
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'mydb',
        debug: false,
        wait_timeout: 28800,
        multipleStatements: true
        }); }
else if (env === "dev") {
    currentHostURL = "https://test.dev.com";
    pool = mysql.createPool({
connectionLimit: 30,
        waitForConnections: true,
        queueLimit: 0,
        host: 'localhost',
        user: 'root',
        password: 'test',
        database: 'mydb',
        debug: false,
        wait_timeout: 28800,
        multipleStatements: true
});
} else if (env === "prod"){
//prod
    currentHostURL = "https://test.prod.com";
pool = mysql.createPool({
connectionLimit: 80,
        waitForConnections: true,
        queueLimit: 0,
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'mydb',
        debug: false,
        wait_timeout: 28800,
        multipleStatements: true
}); }

const admin = 7;
        const client = 9;
        const manager = 6;
      
        const master = 1;
       
module.exports = { pool: pool, master: master, admin: admin, client: client, manager: manager, env: env, currentHostURL: currentHostURL, logError: function(err, req, res)
    {
        //log error in file system
        logger.error(err);
        //  send notification to dev
        if (req) {
            require('./users').sendErrorEmail([err.stack, err.sql], req.protocol + '://' + req.get('host') + req.originalUrl);
        } else {
            require('./users').sendErrorEmail([err.stack, err.sql], currentHostURL);
        }
        if (res) {
            res.send({status: 'error', message: 'Something went wrong, please try again', data: {}});
        }
        return;
    }}

