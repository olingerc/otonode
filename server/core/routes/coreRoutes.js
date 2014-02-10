var passport =  require('passport')
    , AuthCtrl =  require('../controllers/auth')
    , UserCtrl =  require('../controllers/user')
    , userRoles = require('../../../client/js/core/routingConfig').userRoles
    , accessLevels = require('../../../client/js/core/routingConfig').accessLevels;

module.exports = routes = [

    // OAUTH
    {
        path: '/auth/google',
        httpMethod: 'GET',
        middleware: [passport.authenticate('google')]
    },
    {
        path: '/auth/google/return',
        httpMethod: 'GET',
        middleware: [passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },

    // Local Auth
    {
        path: '/login',
        httpMethod: 'POST',
        middleware: [AuthCtrl.login]
    },
    {
        path: '/logout',
        httpMethod: 'POST',
        middleware: [AuthCtrl.logout]
    },

    // User resource
    {
        path: '/users',
        httpMethod: 'GET',
        middleware: [UserCtrl.index],
        accessLevel: accessLevels.admin
    },
    {
        path: '/users',
        httpMethod: 'POST',
        middleware: [UserCtrl.create],
        accessLevel: accessLevels.admin
    },
    {
        path: '/users/:_id',
        httpMethod: 'DELETE',
        middleware: [UserCtrl.remove],
        accessLevel: accessLevels.admin
    },
    {
        path: '/users/:_id',
        httpMethod: 'PUT',
        middleware: [UserCtrl.update],
        accessLevel: accessLevels.admin
    },

    // All other get requests should be handled by AngularJS's client-side routing system
    {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            var role = userRoles.public, username = '';
            if(req.user) {
                role = req.user.role;
                username = req.user.username;
            }
            res.cookie('user', JSON.stringify({
                'username': username,
                'role': role
            }));
            res.render('index');
        }]
    }
];