/*
class Show(db.Document):
   tvdbid = db.StringField(required=True)
   owner = db.ReferenceField(User, required=True)
   lastwatched = db.StringField(default=None, required=False)
   lastdownloaded = db.StringField(default = None, required=False)
   thumb = db.FileField(required=False)
    
   meta = {
      'indexes': ['tvdbid', {'fields': ('tvdbid', 'owner'), 'unique': True}]
   }
   
class Collection(db.Document):
   owner = db.ReferenceField(User, required=True)
   shows = db.ListField(db.ReferenceField(Show, reverse_delete_rule=4))
   movies = db.ListField(db.ReferenceField(Movie, reverse_delete_rule=4))
   
   meta = {
      'indexes': ['_id']
   }
*/

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
      shows: {
         type: [showSchema]
     }
});

mongoose.model('Show', showSchema);
mongoose.model('Collection', collectionSchema);