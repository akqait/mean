var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var assert=require('assert');
var getUsers = require('./routes/users');
var chaiHttp = require('chai-http');
var request = require('request');
var userDao=require('./routes/DAO/userDAO')


//var server=require('./server')

chai.use(chaiHttp)




  describe('User', function() {
    it('Authenticate User', function(done) { // added "done" as parameter
        assert.doesNotThrow(function() {
            userDao.userAuthDAO('test@gmail.com','tes', function(res) {
                assert.equal(res.value.status.toString(),'success'); // will not fail assert.doesNotThrow
                done(); // call "done()" the parameter
            }, function(err) {
                if (err) throw err; // will fail the assert.doesNotThrow
                done(); // call "done()" the parameter
            });
        });
    });
   
});
  
  
  

