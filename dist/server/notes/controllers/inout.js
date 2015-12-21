'use strict';

/**
 * Load mongo models into mongoose
 */

require('../models/models.js');

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Card = mongoose.model('Card'),
    Stack = mongoose.model('Stack'),
    Att = mongoose.model('Att'),
    UrlAtt = mongoose.model('UrlAtt'),
    fs = require('fs-extra'),
    async = require('async');

var exportFolder = "/home/christophe/otoexport";

/*
On import:
recreate thumbs
read detial from oto.json
if not exits, create minum

On Export
floating has a floating folder
archive has an archive folder
card details are inside since part of the information

*/

exports.exportnotes = function(req, res) {
    Card.find({}, function(searcherr, cards) {
        if (searcherr) {
            console.log('searcherr', searcherr);
            return res.status(500).send(searcherr);
        }
        async.map(cards, prepareCardFolder, function(prepareerr , results) {
            if (prepareerr) {
                console.log('prepareerr', prepareerr);
                res.status(500).send(prepareerr);
            } else {
                res.status(200).send();
            }
        });
    });

};

function prepareCardFolder(card, callback) {
    // Create stack folder
    Stack.findById(card.stackid, function (finderr, stack) {
        if (finderr) {
            callback(finderr, null);
        } else {
            if (!stack) {
                stack = {"title": "Orphans"};
            }
            var stackPath = exportFolder + "/" + stack.title;
            var cardPath = stackPath + "/" + card.title;
            var archivePath = exportFolder + "/Archive";
            var finalPath;

            if (card.archivedat) {
                finalPath = archivePath + "/" + card.title;
            } else {
                finalPath = cardPath;
            }
            fs.mkdirs(finalPath, function(mkerr) {
                if (mkerr) {
                    if (mkerr.code === "EEXSITS") {
                        //pass
                    }
                    else {
                        // Fatal Error
                        console.log('mkerr', mkerr);
                        return callback(mkerr, null);
                    }
                }

                getUrls(card, function (attserr, cardWithUrls) {
                    if (attserr) {
                        console.log('attserr', attserr);
                        callback(attserr, null);
                    } else {
                        copyFiles(cardWithUrls, finalPath, function (fileserr) {
                            if (fileserr) {
                                console.log('fileserr', fileserr);
                            } else {
                                saveCardJson(cardWithUrls, stack, finalPath, function (saverr) {
                                    if (saverr) {
                                        console.log('saverr', saverr);
                                    } else {
                                        callback(null, "done");
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
}

function saveCardJson(card, stack, path, savecallback) {
    // urls is new
    var cardToKeep = _.pick(card, ["createdat", "content", "archivedat", "modifiedat", "duedate", "urls"]);
    cardToKeep.stackTitle = stack.title;

    fs.writeFile(path + "/oto.json", JSON.stringify(cardToKeep), function(saverr) {
        if (saverr) {
            console.log("saverr", saverr);
            return savecallback(saverr, null);
        }
        savecallback(null, "done");
    });
}

function getUrls(card, copycallback) {
    if (card.urlattachments && card.urlattachments.length > 0) {
        UrlAtt.find({cardid: card.id}, function (finderr, atts) {
            if (finderr) {
                console.log('findurlserr', finderr);
                callback(finderr, null);
            } else {
                card.urls = [];
                _.each(atts, function(att) {
                    card.urls.push(att.url);
                });
                copycallback(null, card);
            }
        });
    } else {
        copycallback(null, card);
    }
}

function copyFiles(card, path, copycallback) {
    if (card.fileattachments && card.fileattachments.length > 0) {
        Att.find({cardid: card.id}, function (finderr, atts) {
            if (finderr) {
                console.log('findfileserr', finderr);
                callback(finderr, null);
            } else {
                card.urls = [];
                _.each(atts, function(att) {
                    if (att.image.original.path) {
                        try {
                          fs.copySync(att.image.original.path, path + "/" + att.image.original.oname);
                        } catch (err) {
                          console.error('Oh no, there was an error: ' + err.message)
                        }
                    } else if (att.default.original.path) {
                        try {
                          fs.copySync(att.default.original.path, path + "/" + att.default.original.oname);
                        } catch (err) {
                          console.error('Oh no, there was an error: ' + err.message)
                        }
                    } else if (att.pdf.original.path) {
                        try {
                          fs.copySync(att.pdf.original.path, path + "/" + att.pdf.original.oname);
                        } catch (err) {
                          console.error('Oh no, there was an error: ' + err.message)
                        }
                    }
                });
                copycallback(null, "done");
            }
        });
    } else {
        copycallback(null, "done");
    }
}
