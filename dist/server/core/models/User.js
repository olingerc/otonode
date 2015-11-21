"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema
    //, _ =               require('underscore')
    , passport =        require('passport')
    , LocalStrategy =   require('passport-local').Strategy
    , GoogleStrategy =  require('passport-google').Strategy
    //, check =           require('validator').check
    , userRoles =       require('../../../client/js/core/routingConfig').userRoles
    , crypto =          require('crypto');

/**
 * User Schema
 */
var UserSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    role: {},
    email: String,
    salt: String,
    hashed_password: String,
    provider: String,
    google: {}
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(function(name) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (!this.provider) return true;
    return (typeof name === 'string' && name.length > 0);
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (!this.provider) return true;
    return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (!this.provider) return true;
    return (typeof username === 'string' && username.length > 0);
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (!this.provider) return true;
    return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && !this.provider)
        next(new Error('Invalid password'));
    else
        next();
});


/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    
    /**
     * Censor - remove sensitive data from user
     * 
     * @return {User}
     * @api public
     */
    censor: function() {
       if (this.hashed_password) this.hashed_password = undefined;
       if (this.salt) this.salt = undefined;
       if (this.google) this.google = undefined;
       return this;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

/*
module.exports = {
    findOrCreateOauthUser: function(provider, providerId) {
        var user = module.exports.findByProviderId(provider, providerId);
        if(!user) {
            user = {
                id: _.max(users, function(user) { return user.id; }).id + 1,
                username: provider + '_user', // Should keep Oauth users anonymous on demo site
                role: userRoles.user,
                provider: provider
            };
            user[provider] = providerId;
            users.push(user);
        }

        return user;
    },

    findByProviderId: function(provider, id) {
        return _.find(users, function(user) { return user[provider] === id; });
    },

    validate: function(user) {
        check(user.username, 'Username must be 1-20 characters long').len(1, 20);
        check(user.password, 'Password must be 5-60 characters long').len(5, 60);
        check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);

        // TODO: Seems node-validator's isIn function doesn't handle Number arrays very well...
        // Till this is rectified Number arrays must be converted to string arrays
        // https://github.com/chriso/node-validator/issues/185
        var stringArr = _.map(_.values(userRoles), function(val) { return val.toString(); });
        check(user.role, 'Invalid user role given').isIn(stringArr);
    }
};
*/

mongoose.model('User', UserSchema);