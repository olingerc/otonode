'use strict';

/**
 * Load mongo models into mongoose
 */

require('../models/models.js');

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Stack = mongoose.model('Stack');


exports.getall = function(req, res) {
    var currentuser_id = req.session.passport.user;

    Stack
    .find({owner: currentuser_id})
    .sort({createdat:-1})
    .exec(function (err, stacks) {
        if (err) {
            console.log(err)
            res.send(error, 500)
        } else {
            var floating = _.find(stacks, function(stack){ return stack.title === 'Floating'});
            //Make sure this user has a floating stack
            if (floating) return res.send(stacks, 200);
            else {
                floating = Stack({
                    title: 'Floating',
                    owner: currentuser_id
                });
                stacks.push(floating);
                floating.save(function() {
                    res.send(stacks, 200);
                })
            }
        }
    });
};

exports.post = function(req, res) {
    var currentuser_id = req.session.passport.user,
        title = req.body.title;
    var stack = new Stack({title: title, owner: currentuser_id});
    stack.save(function(err) {
        if (err) {
            console.log(err);
            return res.send(err, 500);
        }
        res.send(stack, 201)
    })
};

exports.put = function(req, res) {
    var stackid = req.params.stackid;
    var newTitle = req.body.title;

    Stack
    .findById(stackid)
    .exec(function (err, stack) {
        if (err) {
            console.log(err);
            return res.send(err, 500);
        }
        if (!stack) {
            console.log('stack not found');
            return res.send('stack not found', 500);
        }

        stack.title = newTitle;
        stack.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            res.send(stack, 201)
        })
    })
};

exports.delete = function(req, res) {
    var stackid = req.params.stackid;

    Stack
    .findById(stackid)
    .exec(function (err, stack) {
        if (err) {
            console.log(err);
            return res.send(err, 500);
        }
        if (!stack) {
            console.log('stack not found');
            return res.send('stack not found', 500);
        }
        stack.remove(function(err) {
            if (err) {
                console.log(err);
                return res.send(err, 500);
            }
            res.send(stack, 200)
        })
    })
};