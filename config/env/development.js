'use strict';

module.exports = {
    db: 'mongodb://localhost/otonode-dev',
    app: {
        name: 'OTO - Development'
    },
    google: {
        clientID: '619795269050-gh24caheld794f57b2kd26i44dq1agfq.apps.googleusercontent.com',
        clientSecret: 'dh1baFcADwvlmSSxkR-Idgt1',
        callbackURL: 'http://localhost:3000/auth/google/return'
    }
};