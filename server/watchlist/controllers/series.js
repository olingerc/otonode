'use strict';

/**
 * Load mongo models into mongoose
 */

//require('../models/series');

/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
   tvDB = require("thetvdb-api"),
   key = require("../../../config/config").TVDBAPIKEY,
   proxy = require("../../../config/config").proxy;
    //Kitty = mongoose.model('Kitty');

exports.create = function(req, res) {
   var kitty = new Kitty(req.body);
   kitty.save(function(err) {
      if (err) {
         console.log(err);
      }

      return res.send(kitty);
   });
};

exports.all = function(req, res) {
    Kitty.find().sort('-created').populate('kitty', 'name').exec(function(err, kitties) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(kitties);
        }
    });
};

exports.search = function(req, res) {
   tvDB(key, proxy).getBanners(79349, function(err, data) {
     if (!err) res.send(data);
   });
};