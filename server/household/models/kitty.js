/**
 * Module depenencies
 */

var mongoose = require('mongoose')
  , Schema =   mongoose.Schema;


/**
 * Kitty Schema
 */

var kittySchema = Schema({
    name: String
});


mongoose.model('Kitty', kittySchema);
