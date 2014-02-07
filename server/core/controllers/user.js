var _ =           require('underscore')
    , User =      require('../models/User.js')
    , userRoles = require('../../../client/js/core/routingConfig').userRoles;

module.exports = {
    index: function(req, res) {
        var users = User.findAll();
        _.each(users, function(user) {
            delete user.password;
            delete user.google;
        });
        res.json(users);
    }
};