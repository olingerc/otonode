'use strict';

module.exports = {
    db: 'mongodb://localhost/otonode-dev',
    app: {
        name: 'OTO - Development'
    },
    google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    }
};