'use strict';

module.exports = {
    db: 'mongodb://localhost/otonode',
    app: {
        name: 'OTO - Production'
    },
    google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    }
};