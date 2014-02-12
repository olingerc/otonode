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
   fs = require('fs');

exports.search = function(req, res) {
   var query = req.query.query;

   if (query) {
      tvDB(key, proxy).getSeries(query, function(err, tvdbres) {
        if (err) {
           console.log(err);
           res.send(500, err);
        } else {
           var showsPrepared = prepareShowsSearchJSON(tvdbres.Data.Series);
           res.send(showsPrepared);
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

function prepareShowsSearchJSON(tvdbdata) {
   var showArray = [];
   _.each(tvdbdata, function(show) {
      //I only accept results that are featured on IMDB
      if (_.has(show, 'IMDB_ID')) {
         //TODO: check if most shows have a banner in the getSeries data. otherwise make a more complicated request to getBanners
         var preparedShow =_.pick(show, 'seriesid', 'SeriesName', 'banner', 'Overview', 'FirstAired', 'Network', 'IMDB_ID');
         if (!preparedShow.FirstAired) preparedShow.FirstAired = 'NA';
         if (!preparedShow.Network) preparedShow.Network = 'NA';
         showArray.push(preparedShow);
         if (proxy === '') saveImageFromTVDB(show.seriesid, show.banner);
      }
   });
   return showArray;
}

function saveImageFromTVDB(seriesid, imageurl) {
   //http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js
   //TODO: do I need to wait for the finish event?
   try {
      var request = http.get("http://thetvdb.com/banners/" + imageurl, function(response) {
         var file = fs.createWriteStream("/var/tmp/" + seriesid + ".jpg");
         response.pipe(file);
      });
   } catch (err) {
      console.log(err);
   }
}
