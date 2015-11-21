"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * show Schema
 */
var showSchema = new Schema({
   tvdbid: String,
   lastwatched: String,
   lastdownloaded: String
});

/**
 * collection Schema
 */
var collectionSchema = new Schema({
      userid: String,
      shows: [showSchema]
});

mongoose.model('Collection', collectionSchema);