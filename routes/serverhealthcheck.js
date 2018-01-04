var config = require('./dbconfig');
var app = require('./util');
//This function is to check mysql is working or not
exports.checkMysql = function(req, res) {
    if (req.body.username === app.healthCheckUsername && req.body.password === app.healthCheckPassword) {
        var connection = config.pool;
        connection.query("select user_id from dc_user limit 1", function(err, result) {
            if (err) {
                res.send({status: 'error', message: 'MySQL is down', data: {}});
            } else {
                if (result[0].user_id > 0) {
                    res.send({status: 'success', message: 'MySQL is working fine', data: {}});
                } else {
                    res.send({status: 'error', message: 'MySQL is down', data: {}});
                }
            }
        });
    } else {
        res.send({status: 'error', message: 'Unauthorized', data: {}});
    }
}
//This function is to check mongo is working or not
exports.checkMongo = function(req, res) {
    if (req.body.username === app.healthCheckUsername && req.body.password === app.healthCheckPassword) {
        var mongo = require('mongodb').MongoClient;
        mongo.connect(config.mongoUrl, function(err, db) {
            if (err) {
                res.send({status: 'error', message: 'MongoDB is down', data: {}});
            } else {
                db.collection(config.chatCollectionName).find().limit(1).toArray(function(err, results) {
                    if (err) {
                        db.close();
                        res.send({status: 'error', message: 'MongoDB is down', data: {}});

                    } else {
                        db.close();
                        if (results) {
                            res.send({status: 'success', message: 'MongoDB is working fine', data: {}});
                        } else {
                            res.send({status: 'error', message: 'MongoDB is down', data: {}});
                        }


                    }
                });
            }
        });
    } else {
        res.send({status: 'error', message: 'Unauthorized', data: {}});
    }
}
//This function is to calculate disk space
exports.checkDiskSpace = function(req, res) {
    if (req.body.username === app.healthCheckUsername && req.body.password === app.healthCheckPassword) {

        var ds = require('fd-diskspace');
        ds.diskSpace(function(err, info) {
            if (err) {
                res.send({status: 'error', message: 'Something went wrong', data: {}});
            } else {
                var diskSpaceArray = [];
                for (var disk in info.disks) {
                    if (info.disks.hasOwnProperty(disk)) {

                        diskSpaceArray.push({diskname: disk, free: (info.disks[disk].free / 1048576).toFixed(3), size: (info.disks[disk].size / 1048576).toFixed(3), used: (info.disks[disk].used / 1048576).toFixed(3), usedPercent: (info.disks[disk].percent * 100).toFixed(2)})
                    }
                }

                res.send({status: 'success', message: '', data: {data: diskSpaceArray}});
            }
        });
    } else {
        res.send({status: 'error', message: 'Unauthorized', data: {}});
    }
}
//This function is to authenticate user
exports.healthCheckAuth = function(req, res) {

    if (req.body.username === app.healthCheckUsername && req.body.password === app.healthCheckPassword) {
        res.send({status: 'success', message: 'Authenticate successfully', data: {}});
    } else {
        res.send({status: 'error', message: 'Unauthorized', data: {}});
        }
}