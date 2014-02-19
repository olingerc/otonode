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
   proxy = require("../../../config/config").proxy,
   rootPath = require("../../../config/config").root,
   _ = require("underscore"),
   http = require('http'),
   fs = require('fs'),
   async = require("async");


exports.search = function(req, res) {
   var query = req.query.query;

   if (query) {
      tvDB(key, proxy).getSeries(query, function(err, tvdbres) {
        if (err) {
           console.log(err);
           res.send(500, err);
        } else {
           if (tvdbres.Data) {
              prepareShowsSearchJSON(tvdbres.Data.Series, function(shows) {
                 res.send(shows);
              });
           } else {
              res.send();
           }
        }
      });
   } else {
      res.send(500, 'No query received from client');
   }
};

exports.thumb = function(req, res) {
   var file = '/var/tmp/' + req.params.seriesid + ".jpg";
   fs.exists(file, function(exists) {
      if (exists) {
         res.sendfile(file);
      } else {
         res.sendfile('/client/img/error.jpg', {'root': rootPath});
      }
   });
};

function prepareShowsSearchJSON(tvdbdata, allShowsPreparedCallback) {
   var showArray = [];
   if (!_.isArray(tvdbdata)) tvdbdata = [tvdbdata]; //tvdb returns object if only one result

   _.each(tvdbdata, function(show) {
      //I only accept results that are featured on IMDB
      if (_.has(show, 'IMDB_ID')) {
         //TODO: check if most shows have a banner in the getSeries data. otherwise make a more complicated request to getBanners
         var preparedShow =_.pick(show, 'seriesid', 'SeriesName', 'banner', 'Overview', 'FirstAired', 'Network', 'IMDB_ID');
         if (!preparedShow.FirstAired) preparedShow.FirstAired = 'NA';
         if (!preparedShow.Network) preparedShow.Network = 'NA';
         showArray.push(preparedShow);
      }
   });
   async.map(showArray, saveImageFromTVDB, function (err, results) {
     allShowsPreparedCallback(showArray); //Give back the inital collect, because we did not change it. we just waited for all images to be saved
   });
}

var saveImageFromTVDB = function(show, imageSavedCallback) {
   var seriesid = show.seriesid,
      imageurl = show.banner;
   var dest = "/var/tmp/" + seriesid + ".jpg";
   
   //Check if file exists
   fs.exists(dest, function(exists) {
      if (exists) {
         return imageSavedCallback(null);
      } else {
         //It does not. Download it
         try {
            var file = fs.createWriteStream(dest);
            var request = http.get("http://thetvdb.com/banners/" + imageurl, function(response) {
               response.pipe(file);
               file.on('finish', function() {
                  return imageSavedCallback(null);
               });
            });
         } catch (err) {
            console.log(err);
            return imageSavedCallback(null);
         }
      }
   });
};
