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
  , userRoles =   require('../../../client/js/core/routingConfig').userRoles;


/**
 * Public user api methods
 */

module.exports = {
    index: function(req, res) {
        User.find({}, function(err, users) {
           _.each(users, function(user) {
               user.censor();
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
        var message = null;
        user.save(function(err, user) {
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
            else res.json(user.censor());
         });
    },
    update: function(req, res, next) {
        /*try { //TODO: somehow validate
            User.validate(req.body);
        }
        catch(err) {
            return res.send(400, err.message);
        }*/
       var id = req.params._id;
       var user = User.findOne({_id:id}, function(err, user) {
          if (err) {
             res.send(500, err);
          } else {
             var updatedUser = req.body;
             _.extend(user, updatedUser);
             user.save(function(err, user) {
                if (err) {
                   res.send(500, err);
                }
                else res.json(user.censor());
             });
          }
       });
    },
    remove: function(req, res, next) {
       User.remove({_id: req.params._id}, function(err) {
          if (err) {
             res.send(500, err);
          }
          else res.send('removed');
       });
   },
   checkAdminMinimum: function(req, res) {
      User.findOne({'username': 'admin'}, function(err, user) {
         if (err) {
            console.log(err);
         }
         if (!user) {
            var user = new User({
               'username':'admin',
               'password':'123',
               'name':'User created by system',
               'role': userRoles.admin
            });
            user.save(function(err) {
               if (err) {
                  console.log('Error while trying to create initial admin user');
                  console.log(err);
               }
            });
            console.log('An initial admin user has been created: admin/123');
         }
      });
   }
};