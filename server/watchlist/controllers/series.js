'use strict';

/**
 * Load mongo models into mongoose
 */

require('../models/models.js');

/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
    tvDB = require("node-tvdb"),
    key = require("../../../config/config").TVDBAPIKEY,
    proxy = require("../../../config/config").proxy,
    rootPath = require("../../../config/config").root,
    _ = require("underscore"),
    http = require('http'),
    fs = require('fs'),
    async = require("async"),
    Collection = mongoose.model('Collection');

var tvdb = new tvDB(key);


exports.search = function(req, res) {
    var query = req.query.query;

    if (query) {
        tvdb.getSeriesByName(query, function(err, tvdbres) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                prepareShowsSearchJSON(tvdbres, function(shows) {
                    res.send(shows);
                });
            }
        });
    } else {
        res.status(500).send('No query received from client');
    }
};

exports.thumb = function(req, res) {
    var file = '/var/tmp/' + req.params.seriesid + ".jpg";
    fs.exists(file, function(exists) {
        if (exists) {
            res.sendfile(file);
        } else {
            res.sendfile('/client/img/error.jpg', {
                'root': rootPath
            });
        }
    });
};

function prepareShowsSearchJSON(tvdbdata, allShowsPreparedCallback) {
    /*[ { seriesid: '79349',
language: 'en',
SeriesName: 'Dexter',
AliasNames: 'Dexter: Early Cuts',
banner: 'graphical/79349-g28.jpg',
Overview: 'He\'s smart, he\'s good looking, and he\'s got a great sense of humor. He\'s Dexter Morgan, everyone\'s favorite serial killer. As a Miami forensics expert, he spends his days solving crimes, & nights committing them. But Dexter lives by a strict code of honor that is both his saving grace and lifelong burden. Torn between his deadly compulsion and his desire for true happiness, Dexter is a man in profound conflict with the world and himself.',
FirstAired: '2006-10-01',
Network: 'Showtime',
IMDB_ID: 'tt0773262',
zap2it_id: 'EP00859795',
id: '79349' } ]*/
    var showArray = [];
    if (!_.isArray(tvdbdata)) tvdbdata = [tvdbdata]; //tvdb returns object if only one result

    _.each(tvdbdata, function(show) {
        //I only accept results that are featured on IMDB
        if (_.has(show, 'IMDB_ID')) {
            //TODO: check if most shows have a banner in the getSeries data. otherwise make a more complicated request to getBanners
            var preparedShow = _.pick(show, 'seriesid', 'SeriesName', 'banner', 'Overview', 'FirstAired', 'Network', 'IMDB_ID');
            preparedShow.FirstAired = preparedShow.FirstAired || 'NA';
            preparedShow.Network = preparedShow.Network || 'NA';
            showArray.push(preparedShow);
        }
    });
    async.map(showArray, saveImageFromTVDB, function(err, results) {
        // Give back the inital collect, because we did not change it.
        // we just waited for all images to be saved
        allShowsPreparedCallback(showArray);
    });
}

var saveImageFromTVDB = function(show, imageSavedCallback) {
    var seriesid = show.seriesid,
        imageurl = show.banner;
    var dest = "/var/tmp/" + seriesid + ".jpg";

    //Check if file exists
    fs.exists(dest, function(exists) {
        if (exists) {
            return imageSavedCallback(null, null);
        } else {
            //It does not. Download it
            try {
                var file = fs.createWriteStream(dest);
                var request = http.get("http://thetvdb.com/banners/" + imageurl, function(response) {
                    response.pipe(file);
                    file.on('finish', function() {
                        return imageSavedCallback(null, null);
                    });
                });
            } catch (err) {
                console.log(err);
                return imageSavedCallback(err, null);
            }
        }
    });
};

exports.addseries = function(req, res) {
    var showid = req.body.showid;

    //Get current user collection
    var currentuser_id = req.session.passport.user;
    Collection.findOne({
        userid: currentuser_id
    }, function(err, collection) {
        if (err) {
            console.log(err);
        }

        if (!collection) {
            var collection = new Collection({
                userid: currentuser_id
            });
            collection.save(function() {
                //We cereated a collection
                addShow(showid, collection, function(show) {
                    prepareShowsCollectionJSON([show], function(results) {
                        res.status(201).send(results[0]);
                    });
                });
            });
        } else {
            //We have a collection
            addShow(showid, collection, function(show) {
                prepareShowsCollectionJSON([show], function(results) {
                    res.status(201).send(results[0]);
                });
            });
        }
    });

    function addShow(thisshowid, collection, cb) {
        // check if show already added, use unique in model
        // and catch error, actually client already does it
        collection.shows.push({
            tvdbid: thisshowid
        });
        collection.save(function(err) {
            //TODO: handle error when unique or other
            cb({
                tvdbid: thisshowid
            });
        });
    }
};


exports.getcollection = function(req, res) {
    var currentuser_id = req.session.passport.user;
    Collection.findOne({
        userid: currentuser_id
    }, function(err, collection) {
        if (err) {
            console.log(err);
        }

        if (!collection) {
            //TODO: what to do here?
            res.send('[]');
        } else {
            //We have a collection
            prepareShowsCollectionJSON(collection.shows, function(shows) {
                res.status(200).send(shows);
            });
        }
    });
};

function prepareShowsCollectionJSON(showsInCollection, allShowsPreparedCallback) {
    async.map(showsInCollection, getSeriesFromTVDB, function(err, results) {
        var showArray = [];
        _.each(results, function(show) {
            var preparedShow = compileShowDetails(show);
            showArray.push(preparedShow);
        });

        async.map(showArray, saveImageFromTVDB, function(err, results) {
            allShowsPreparedCallback(showArray); //Give back the inital collect, because we did not change it. we just waited for all images to be saved
        });

    });

}

var getSeriesFromTVDB = function(showInCollection, showFoundCallback) {
    var showid = showInCollection.tvdbid;
    tvdb.getSeriesAllById(showid, function(err, tvdbres) {
        if (err) {
            console.log('ERROR');
            console.log(err);
            return showFoundCallback(null, null);
        } else {
            if (tvdbres) {
                //TODO: Hackedy-hack: keep mongo data
                tvdbres.lastwatched = showInCollection.lastwatched;
                tvdbres.lastdownloaded = showInCollection.lastdownloaded;
                return showFoundCallback(null, tvdbres);
            } else {
                // TODO: never called? since error if none?
                return showFoundCallback(null, null);
            }
        }
    });
};

function compileShowDetails(show) {
    var preparedShow = _.pick(show.Series, 'id', 'SeriesName', 'IMDB_ID', 'banner', 'Status');
    preparedShow.seriesid = preparedShow.id;

    //User settings
    preparedShow.lastwatched = show.lastwatched;
    preparedShow.lastdownloaded = show.lastdownloaded;

    var stringArray = [],
        found = false,
        now = getDate(),
        nextEpisode;

    _.each(show.Episode, function(episode) {
        if (!_.isString(episode.FirstAired)) {
            episode.FirstAired = 'NA'; //Sometimes empty dates are {}
        }
        if (!_.isString(episode.EpisodeName)) {
            episode.EpisodeName = 'NA'; //Sometimes empty names are {}
        }
        stringArray.push("S" + episode.SeasonNumber + "E" + episode.EpisodeNumber + " " + episode.FirstAired + " " + episode.EpisodeName);

        if (episode.FirstAired != 'NA' && episode.FirstAired >= now && !found) {
            nextEpisode = episode.FirstAired + ", S" + episode.SeasonNumber + "E" + episode.EpisodeNumber;
            found = true;
        }

    });
    //TODO:::
    /*var lastEpisode = _.last(show.Episode);
    preparedShow.totalSeasons = lastEpisode.SeasonNumber;
    preparedShow.episodeList = stringArray;
    preparedShow.nextEpisode = nextEpisode;*/

    return preparedShow;
}

function getDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day;
}

exports.updateSeries = function(req, res) {
    var currentuser_id = req.session.passport.user,
        showid = req.body.showid,
        lastWatched = req.body.lastwatched,
        lastDownloaded = req.body.lastdownloaded;


    Collection.findOne({
        userid: currentuser_id
    }, function(err, collection) {
        if (err) {
            console.log(err);
        }

        if (!collection) {
            //TODO: what to do here?
            res.send('[]');
        } else {
            //We have a collection
            _.each(collection.shows, function(show) {
                if (show.tvdbid == showid) {
                    //We have a show
                    if (lastWatched) {
                        show.lastwatched = lastWatched;
                    }
                    if (lastDownloaded) {
                        show.lastdownloaded = lastDownloaded;
                    }
                }
            });
            collection.save(function(err) { //TODO: why no need to save show before saving collection?
                res.send('OK');
            });
        }
    });
};

exports.removeSeries = function(req, res) {
    //TODO: a speial embedded doc id exists, use that to remove instead of cycling
    //http://mongoosejs.com/docs/2.8.x/docs/embedded-documents.html
    var currentuser_id = req.session.passport.user,
        showid = req.body.showid;


    Collection.findOne({
        userid: currentuser_id
    }, function(err, collection) {
        if (err) {
            console.log(err);
        }

        if (!collection) {
            //TODO: what to do here?
            res.send('[]');
        } else {
            //We have a collection
            _.each(collection.shows, function(show) {
                if (show.tvdbid == showid) {
                    //We have a show
                    collection.shows[collection.shows.indexOf(show)].remove();
                }
            });
            collection.save(function(err) {
                res.send('OK');
            });
        }
    });
};
