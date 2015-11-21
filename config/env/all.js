/*jslint node: true */
"use strict";

var path = require('path');

module.exports = {
    root: path.normalize(__dirname + '/../..'),
   // The secret should be set to a non-guessable string that
   // is used to compute a session hash
   sessionSecret: 'E&R:f>+2s70cy~SpZp4%b(7rb`s!PCxSuD3@po)/M)14{gW-;&5mp3te[+#$k^Oq',
   // The name of the MongoDB collection to store sessions in
   sessionCollection: 'sessions'
};
