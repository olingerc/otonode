'use strict';

// Utilize Lo-Dash utility library
var _ = require('underscore');

// Extend the base configuration in all.js with environment
// specific configuration as well as what modules need (later also by environment)
module.exports = _.extend(
    require(__dirname + '/../config/env/all.js'),
    require(__dirname + '/../config/env/' + process.env.NODE_ENV + '.js') || {},
    require(__dirname + '/../config/modules.js')
);