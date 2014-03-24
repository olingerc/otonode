'use strict';

//TODO: there was an init_app in python notes

/**
 * Load mongo models into mongoose
 */

require('../models/models.js');

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Card = mongoose.model('Card'),
    Att = mongoose.model('Att'),
    UrlAtt = mongoose.model('UrlAtt'),
    async = require('async'),
    exec = require('child_process').exec;


exports.getall = function(req, res) {
    var currentuser_id = req.session.passport.user;



    Card
    .find({owner: currentuser_id})
    .populate('fileattachments')
    .populate('urlattachments')
    .sort({createdat:-1})
    .exec(function (err, cards) {
        if (err) {
            console.log(err)
            return res.send(error, 500)
        }


        _.each(cards, function(card) {
            if (card.fileattachments == null) card.fileattachments = [];
            if (card.urlattachments == null) card.urlattachments = [];
            card.save();
        });

        res.send(cards, 200);
    });
};

exports.get = function(req, res) {
    var cardid = req.params.cardid;

    Card.findOne({_id:cardid})
    .exec(function(err, card) {
        if (err) return res.send(err, 500);

        res.send(card);

    });
};

exports.post = function(req, res) {
    var currentuser_id = req.session.passport.user,
        title = req.body.card.title,
        content = req.body.card.content,
        duedate = req.body.card.duedate,
        stackid = req.body.card.stackid,
        fileattachments = req.body.card.fileattachments,
        urlattachments = req.body.card.urlattachments;

    var clientid = req.body.clientid;
    var card = new Card({
        title: title,
        content: content,
        stackid: stackid,
        owner: currentuser_id
    });

    if (duedate) {
        card.duedate = duedate;
    }

    if (fileattachments) {
        card.fileattachments = _.pluck(fileattachments, '_id');
    }

    if (urlattachments) {
        card.urlattachments = _.pluck(urlattachments, '_id');
    }

    card.save(function (err, card) {
        if (err) {
            console.log(err);
            return res.send(err, 500);
        }
        res.send({card: card, clientid: clientid}, 201);
        //Update atts (not really necessary but easier to clean up floating ones later
        //by just seearching for atts with new
        if (card.fileattachments) {
            async.map(card.fileattachments, function(id, callback) {
                Att
                .findById(id)
                .exec(function (err, att) {
                    if (err) console.log(err);
                    att.cardid = card._id;
                    att.save(function(err, att) {
                        if (err) console.log(err);
                        callback(err, att);
                    });
                });
            }, function(err, results) {
                console.log('updated ' + results);
            });
        }
        if (card.urlattachments) {
            async.map(card.urlattachments, function(id, callback) {
                UrlAtt
                .findById(id)
                .exec(function (err, att) {
                    if (err) console.log(err);
                    att.cardid = card._id;
                    att.save(function(err, att) {
                        if (err) console.log(err);
                        callback(err, att);
                    });
                });
            }, function(err, results) {
                console.log('updated ' + results);
            });
        }
    });
};

exports.put = function(req, res) {
    var cardid = req.params.cardid,
        newTitle = req.body.title,
        newContent = req.body.content,
        archivedat = req.body.archivedat,
        duedate = req.body.duedate,
        stacktitleafterarchived = req.body.stacktitleafterarchived,
        stackid = req.body.stackid;

    Card
    .findById(cardid)
    .populate('fileattachments')
    .populate('urlattachments')
    .exec(function (err, card) {
        if (err) {
            console.log(err);
            return res.send(err, 500);
        }
        if (!card) {
            console.log('card not found');
            return res.send('card not found', 500);
        }

        if (newTitle) card.title = newTitle;
        if (newContent) card.content = newContent;
        card.duedate = duedate; //if no duedate, user maybe wants to remove it

        if (archivedat) {
            card.archivedat = archivedat;
            card.stacktitleafterarchived = stacktitleafterarchived;
        }
        if (stackid) card.stackid = stackid;

        card.save(function (err) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            res.send(card, 201)
        })
    })
};

exports.delete = function(req, res) {
    var cardid = req.params.cardid;

    Card
    .findById(cardid)
    .exec(function (err, card) {
        if (err) {
            console.log(err);
            return res.send(err, 500);
        }
        if (!card) {
            console.log('card not found');
            return res.send('card not found', 500);
        }
        card.remove(function(err) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            res.send(card, 200)
        })
    })
};
exports.upload = function(req, res) {
  var cardid = req.body.cardid,
      reqatt = JSON.parse(req.body.att);

  var position = reqatt.position,
    filename = reqatt.filename;


  var att = new Att({
        position: position,
        filename: filename,
        cardid: cardid
    });

  //Get att type
  var attType = 'default';
  if (req.files.file.type.search('image/') > -1) attType = 'image';
  if (req.files.file.type.search('application/pdf') > -1) attType = 'pdf';

  att.attach(attType, req.files.file, function(err) {
    if(err) return res.send(err, 500);

    att.save(function(err, att) {

      if(err) {
        console.log(error)
        return res.send(att, 500);
      }

      //Save to existing card
      if (!cardid) return res.send('No cardid provided', 500);

      if (cardid.substring(0,3) != 'new') {
        Card
        .findById(cardid)
        .exec(function (err, card) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            if (!card) {
                console.log('card not found');
                return res.send('card not found', 500);
            }
            card.fileattachments.push(att);
            card.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.send(err, 500);
                }
                res.send(att, 200)
            })
        })
      } else {
        //Saving parentless att, retrieve on filesave
        res.send(att, 201);
      }

    });
  })
};

exports.deleteAtts = function(req, res) {
  var cardid = req.body.cardid,
      reqatt_ids = JSON.parse(req.body.array);

      //TODO if cancelling do not change modifiedat

    if (cardid.substring(0,3) != 'new') {
         Card
        .findById(cardid)
        .exec(function (err, card) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            if (!card) {
                console.log('card not found');
                return res.send('card not found', 500);
            }
            _.each(reqatt_ids, function(attid) {
                card.fileattachments.remove(attid);
            });

            card.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.send(err, 500);
                }
                res.send(card, 200)
            });
        });
    }

    //Remove atts
    async.map(reqatt_ids, function(id, callback) {
        Att.remove({_id:id}, function (err) {
            callback(err, null);
        });
    }, function(err, result) {
        console.log('all deleted' + result)
    });
};

exports.addLink = function(req, res) {
    var cardid = req.body.cardid,
      reqatt = JSON.parse(req.body.att);

    var position = reqatt.position,
        url = reqatt.url;

    var filename = cardid + "_" + Math.round(Math.random()*1000) + ".jpg";
    var thumb_path = '/home/christophe/otouploads/urlthumbs/' + filename;
    var thumb_path_url = '/uploads/urlthumbs/' + filename;
    var command = "phantomjs " + __dirname + "/rasterize.js '" + url + "' '" + thumb_path + "'";
    exec(command, function (err, stdout, stderr) {
        console.log(err, stdout, stderr)
      if (err) return res.send(err, 500);

      var att = new UrlAtt({
            position: position,
            url: url,
            urlThumb: thumb_path_url,
            cardid: cardid
        });

        att.save(function(err, att) {

          if(err) {
            console.log(error)
            return res.send(att, 500);
          }

          //Save to existing card
          if (!cardid) return res.send('No cardid provided', 500);

          if (cardid.substring(0,3) != 'new') {
            Card
            .findById(cardid)
            .exec(function (err, card) {
                if (err) {
                    console.log(err);
                    return res.send(err, 500);
                }
                if (!card) {
                    console.log('card not found');
                    return res.send('card not found', 500);
                }
                card.urlattachments.push(att);
                card.save(function(err) {
                    if (err) {
                        console.log(err);
                        return res.send(err, 500);
                    }
                    res.send(att, 200)
                })
            })
          } else {
            //Saving parentless att, retrieve on filesave
            res.send(att, 201);
          }
      });
    });
};

exports.deleteLinks = function(req, res) {
  var cardid = req.body.cardid,
      reqatt_ids = JSON.parse(req.body.array);

      //TODO if cancelling do not change modifiedat

    if (cardid.substring(0,3) != 'new') {
         Card
        .findById(cardid)
        .exec(function (err, card) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            if (!card) {
                console.log('card not found');
                return res.send('card not found', 500);
            }
            _.each(reqatt_ids, function(attid) {
                card.urlattachments.remove(attid);
            });

            card.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.send(err, 500);
                }
                res.send(card, 200)
            });
        });
    }

    //Remove atts
    async.map(reqatt_ids, function(id, callback) {
        UrlAtt.remove({_id:id}, function (err) {
            callback(err, null);
        });
    }, function(err, result) {
        console.log('all deleted' + result)
    });
};