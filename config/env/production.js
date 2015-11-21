'use strict';

module.exports = {
    port: process.env.PORT || 80,
    db: 'mongodb://localhost/otonode',
    app: {
        name: 'OTO - Production'
    },
    google: {
        clientID: '619795269050-gh24caheld794f57b2kd26i44dq1agfq.apps.googleusercontent.com',
        clientSecret: 'dh1baFcADwvlmSSxkR-Idgt1',
        callbackURL: 'http://199.195.118.87:3000/auth/google/callback'
    }
};
