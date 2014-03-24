"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var localfs = require('mongoose-attachments-localfs');

localfs.prototype.getUrl = function(path) {
  return path.replace('/home/christophe/otouploads', '/uploads'); //TODO: mabe use virtual field type to get url?
}
var attachments = require('mongoose-attachments');

/**
 * Stacks Schema
 */

var StackSchema = new Schema({
    title:      { type: String, required: true, trim: true, max: 140},
    owner:      {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdat:  { type: Date , index: true},
    modifiedat: { type: Date }
});

StackSchema.index({ title: 1, owner: 1}, { unique: true });

StackSchema.pre('save', function (next){
  this.modifiedat = new Date;
  if ( !this.createdat ) {
    this.createdat = new Date;
  }
  next();
});

mongoose.model('Stack', StackSchema);


/**
 * Att
 */

/*
convert source.png -resize '50%' output.png

command = "convert -density 170 -thumbnail x300 /var/tmp/" + str(att.id) + "[0] -flatten '/var/tmp/" + str(att.id) + ".jpg'"

Example in plugin options:

styles: {
  small: {
    resize: '50%'
  }
}
*/

var AttSchema = new Schema({
  position: Number,
  cardid: String,
  filename: String
});
attachments.registerDecodingFormat('PDF');
AttSchema.plugin(attachments, {
    directory: '/home/christophe/otouploads',
    storage : {
        providerName: 'localfs'
    },
    /* TODO:
    directory: "/home/rngadam/letsface/src/prototype/public/images",
    storage : {
        providerName: 'localfs',
        options : {
          removePrefix: "/home/rngadam/letsface/src/prototype/public"
        }
    },
    */
    properties: {
        'default': {
            styles: {
                original: {
                    // keep the original file
                }
            }
        },
        pdf: {
            styles: {
                original: {
                    // keep the original file
                },
                thumb: {
                    density: '170',
                    thumbnail: 'x300',
                    layers: 'flatten',
                    '$format': 'jpg'
                }
            }
        },
        image: {
            styles: {
                original: {
                    // keep the original file
                },
                thumb: {
                    thumbnail: '100x100^',
                    gravity: 'center',
                    extent: '100x100',
                    '$format': 'jpg'
                }
            }
        }
    }
});
AttSchema.virtual('detail_img').get(function () {
    return path.join('detail', path.basename(this.image.detail.path));
});
AttSchema.virtual('thumb_img').get(function () {
    return path.join('thumb', path.basename(this.image.thumb.path));
});

mongoose.model('Att', AttSchema);


/**
URL
*/
var UrlAttSchema = new Schema({
  position: Number,
  cardid: String,
  url: String,
  urlThumb: String
});

mongoose.model('UrlAtt', UrlAttSchema);


/**
 * Cards Schema
 */

var CardSchema = new Schema({
    title:                  {type: String, required: true, trim: true, max: 140},
    content:                String, //TODO: max
    stackid:                {type: mongoose.Schema.Types.ObjectId, ref: 'Stack'},
    owner:                  {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdat:              {type: Date , index: true},
    modifiedat:             {type: Date, index: true},
    stacktitleafterarchived:String,
    archivedat:             {type: Date},
    duedate:                {type: Date},
    fileattachments:        [{type: mongoose.Schema.Types.ObjectId, ref: 'Att'}],
    urlattachments:        [{type: mongoose.Schema.Types.ObjectId, ref: 'UrlAtt'}]
});

CardSchema.pre('save', function(next){
  this.modifiedat = new Date;
  if ( !this.createdat ) {
    this.createdat = new Date;
  }
  next();
});

mongoose.model('Card', CardSchema);

