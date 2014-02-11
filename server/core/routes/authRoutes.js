var passport =  require('passport')
    , AuthCtrl =  require('../controllers/auth')
    , UserCtrl =  require('../controllers/user')
    , accessLevels = require('../../../client/js/core/routingConfig').accessLevels;

module.exports = [

    // OAUTH
    {
        path: '/auth/google',
        httpMethod: 'GET',
        /*middleware: [passport.authenticate('google', {
           failureRedirect: '/login',
           scope: [
               'https://www.googleapis.com/auth/userinfo.profile',
               'https://www.googleapis.com/auth/userinfo.email'
           ]
        })]*/
       middleware: [AuthCtrl.hey]
    },
    {
        path: '/auth/google/return',
        httpMethod: 'GET',
        middleware: [passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },

    /*
    // Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);*/

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
    }
];