"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Stacks Schema
 */

var StackSchema = new Schema({
    title:      { type: String, required: true, trim: true} , //TODO:, max-length
    owner:      {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdat:  { type: Date , index: true},
    modifiedat: { type: Date }
});

StackSchema.index({ title: 1, owner: 1}, { unique: true });

StackSchema.pre('save', function(next){
  this.modifiedat = new Date;
  if ( !this.createdat ) {
    this.createdat = new Date;
  }
  next();
});

mongoose.model('Stack', StackSchema);


/**
 * Cards Schema
 */

var CardSchema = new Schema({
    title:                  {type: String, required: true, trim: true} , //TODO:, max-length
    content:                String,
    stackid:                {type: mongoose.Schema.Types.ObjectId, ref: 'Stack'},
    owner:                  {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdat:              {type: Date , index: true},
    modifiedat:             {type: Date, index: true},
    stacktitleafterarchived:String,
    archivedat:             {type: Date},
    duedate:                {type: Date}
});

CardSchema.pre('save', function(next){
  this.modifiedat = new Date;
  if ( !this.createdat ) {
    this.createdat = new Date;
  }
  next();
});

mongoose.model('Card', CardSchema);




/*
class Attachment(db.Document):
   filename = db.StringField(required=True)
   mimetype = db.DynamicField(required=False)
   thumb = db.BooleanField(default=False, required=True)
   cardid = db.StringField(required=False)
   position = db.IntField(required=False)
   #i know its not great that the att knows about the card,
   #but I use this to create thumbs in the background and assign to correct card on finish
   #also when saving a new card I retrive dangling atts and add them to the card

   meta = {
      'allow_inheritance': True
   }

class ImageAttachment(Attachment):
   image = db.ImageField(thumbnail_size=(200,200, False))

   meta = {
      'indexes': ['_id']
   }

class FileAttachment(Attachment):
   file = db.FileField(required=True)
   thumbfile = db.FileField(required=False)

   meta = {
      'indexes': ['_id']
   }

class UrlAttachment(db.Document):
   url = db.StringField(required=True)
   thumb = db.BooleanField(default=False, required=True)
   thumbfile = db.FileField(required=False)
   cardid = db.StringField(required=False)
   position = db.IntField(required=False)

   meta = {
      'indexes': ['_id']
   }
*/
