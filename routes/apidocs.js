var util = require('./util');

exports.apidocAuth = function(req, res) {

    if (util.apidocPass == req.query.pass) {
        res.send('valid password');
        res.end();
    } else {
        res.send(req.protocol + '://' + req.get('Host'));
        res.end();
    }

}