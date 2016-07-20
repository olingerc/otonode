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

var execFile = require('child_process').execFile;
var jsonfile = require('jsonfile');

var exportFolder = "/home/christophe/otoexport";
var importFolder = "/home/christophe/Desktop/Chris Notes";

/*
On import:
(during development, delete all cards on import)
read folder names, name will be note title
read detail from oto.json
if not exits, create default
add all files in the foldr
recreate thumbs of knwon file types with thumb_filename
if oto.json has urls, create thumbs for those


On Export
floating has a floating folder
archive has an archive folder
card details are inside since part of the information

*/

exports.importfolder = function(req, res) {
    var notesFolder = importFolder;//req.query.notesFolder;

    // Delete all cards first
    Card.remove({}, function(err) {
        collectNotesInFolder(notesFolder, function(err2, notes) {
                if (err2) {
                    res.status(500).send(err2);
                } else {
                    async.map(
                        notes,
                        readOrWriteOto.bind({ notesFolder: notesFolder }),
                        function(err, parsedNotes) {
                            // TODO What NOW ?
                            // - create thumbs ?
                            // - read into db or overwrite all in db?
                            res.status(200).send(parsedNotes);
                        }
                    )
                }
        });
    });
};

function readOrWriteOto(note, callback) {
    // the this context comes because I use bind when calling the function
    var otoPath = this.notesFolder + "/" + note.noteTitle + "/_oto.json";
    jsonfile.readFile(otoPath, function(err1, obj) {
        if (err1) {
            // Create new oto.json
            if (err1.code === "ENOENT") {
                jsonfile.writeFile(otoPath, note, {spaces: 2}, function(err2) {
                    if (err2) {
                        note.otoError = err2;
                    }
                    callback(null, note);
                });
            // Another error has occured while reading
            } else {
                //TODO: jsonfile throws the error in that case ??
                note.otoError = err1;
                callback(null, note);
            }
        } else {
            // Succesfully read oto.json
            callback(null, obj);
        }
    });
}

function collectNotesInFolder(folder, callback) {
    // linux find command, much faster than node fs module
    //TODO: fix depth to 1
    execFile(
        'find',
        [
            folder,
            "-printf",
            "%p\t%TY-%Tm-%Td %TH:%TM:%TS %Tz\t%y\n"
        ],
        {maxBuffer: 200 * 1024 * 1000},
    function(err, stdout, stderr) {
        if (err) {
            callback(err, []);
            return;
        }

        var allNotes = {};
        var noteTitle;
        var thisNoteTitle;
        var pathList;
        var fileType;
        var mtime;
        var noteLastMtime;
        var fileName;
        var otoObj;
        var fileObject;
        var files = stdout.split('\n');

        // find gives unneeded items
        files.shift();
        files.pop();
        var filesLeft = files.length;

        _.each(files, function(line) {
            // Cut away parent folder and Samples)
            line = line.substring(folder.length + 1, line.length);

            // extract info, //path = 1, mtime = 2, type = 3
            line = line.split("\t");
            pathList = line[0].split("/");
            thisNoteTitle = pathList.shift();
            noteLastMtime = line[1];
            fileType = line[2];

            if (!allNotes[thisNoteTitle]) {
                allNotes[thisNoteTitle] = {
                    "noteTitle": thisNoteTitle,
                    "lastModified": noteLastMtime,
                    "atts": [],
                    "urls": []
                };
            }

            // something in notefolder, we took out root folder name with shift above
            if (pathList.length === 1 && fileType === "f") {
                // something within the note folder
                fileName = pathList[0];
                if (fileName !== "_oto.json" && fileName.substring(0, 6) !== "thumb_" && fileType === "f") {
                    allNotes[thisNoteTitle].atts.push(fileName);
                }
            }
        });
        callback(null, _.values(allNotes));
    });
}



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
