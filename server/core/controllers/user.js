'use strict';

/**
 * Load mongo models into mongoose
 */

require('../models/User');

/**
 * Module dependencies
 */

var mongoose =    require('mongoose')
  , User =        mongoose.model('User')
  , _ =           require('underscore')
  , userRoles = require('../../../client/js/core/routingConfig').userRoles;

module.exports = {
    index: function(req, res) {
        User.find({}, function(err, users) {
           _.each(users, function(user) {
               delete user.hashed_password; //TODO: this does not work!
               delete user.salt;
               delete user.google;
           });
           res.json(users);
        });
    },
    create: function(req, res, next) {
        /*try { //TODO: somehow validate
            User.validate(req.body);
        }
        catch(err) {
            return res.send(400, err.message);
        }*/
        var user = new User(req.body);
        user.provider = 'local'; //TODO: where is this set in the github inspirations?

        var message = null;
        user.save(function(err) {
           if (err) {
              switch (err.code) {
                 case 11000:
                 case 11001:
                    message = 'Username already exists';
                    break;
                 default:
                    message = 'Please fill all the required fields';
               }
               res.send(500, message);
            }
            res.json(user);
         });

        /*User.addUser(req.body.username, req.body.password, req.body.role, function(err, user) {
            if(err === 'UserAlreadyExists') return res.send(403, "User already exists");
            else if(err)                    return res.send(500);
        });*/
    },
    remove: function(req, res, next) {
        /*try { //TODO: somehow validate
            User.validate(req.body);
        }
        catch(err) {
            return res.send(400, err.message);
        }*/
       User.remove({_id: req.params._id}, function(err) {
          if (err) {
             res.send(500, err);
          }
          res.send('ok');

       });
   }
};