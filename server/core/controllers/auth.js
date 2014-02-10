'use strict';

/**
 * Load mongo models into mongoose
 */

require('../models/User');


/**
 * Module dependencies
 */

var passport =  require('passport')
  , mongoose =  require('mongoose')
  , User =      mongoose.model('User')
  , _ =         require('underscore')
  , userRoles = require('../../../client/js/core/routingConfig').userRoles;


module.exports = {
    login: function(req, res, next) {
        passport.authenticate('local', function(err, user) {
            if(err)     { return next(err); }
            if(!user)   { return res.send(400); }

            req.logIn(user, function(err) {
                if(err) {
                    return next(err);
                }

                if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; //TODO
                res.json(200, { "role": user.role, "username": user.username });
            });
        })(req, res, next);
    },

    logout: function(req, res) {
        req.logout();
        res.send(200);
    }
};