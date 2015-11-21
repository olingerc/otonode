'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');
var os = require('os');

module.exports = {
   root: rootPath,
   port: process.env.PORT || 3000,

   // The secret should be set to a non-guessable string that
   // is used to compute a session hash
   sessionSecret: 'E&R:f>+2s70cy~SpZp4%b(7rb`s!PCxSuD3@po)/M)14{gW-;&5mp3te[+#$k^Oq',
   // The name of the MongoDB collection to store sessions in
   sessionCollection: 'sessions',
   proxy: defineProxy()
};

function defineProxy() {
   var interfaces = os.networkInterfaces();
   var addresses = [];
   var inLns = false;
   for (var k in interfaces) {
       for (var k2 in interfaces[k]) {
           var address = interfaces[k][k2];
           if (address.family == 'IPv4' && !address.internal) {
               addresses.push(address.address);
               if (address.address.substring(0, 3) === '148' || address.address.substring(0, 3) === '110') inLns = true;
           }
       }
   }
   if (inLns) return 'http://proxy.etat.lu:80';
   else return '';
}
