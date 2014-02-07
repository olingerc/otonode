var express = require('express');
var app = module.exports = express();
var model = require('./model.js');

app.get('/householdapi/all', function(req, res) {
   model.all(function(err, notes) {
      res.send(notes);
   });
});

app.get('/householdapi/one', function(req, res) {
   model.one(function(err, note) {
      res.send(note);
   });
});

