'use strict';

var thesestacks =
[
    {
        "owner": null,
        "title": "Bestellungen Iessen",
        "id": "52fa8250b0d86d1ec06c3b70",
        "createdat": "2014-02-11T21:04:32",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Bioseq WORK",
        "id": "52fa2285b0d86d1ec06c3b6a",
        "createdat": "2014-02-11T14:15:49",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "MEAN",
        "id": "52f3a69db0d86d1ec06c3b44",
        "createdat": "2014-02-06T16:13:33",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Work",
        "id": "52e64725b0d86d435868dc8f",
        "createdat": "2014-01-27T12:46:45",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Medical",
        "id": "52e62e38b0d86d435868dc8d",
        "createdat": "2014-01-27T11:00:24",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Snippets",
        "id": "52e2610eb0d86d6e45e39c2e",
        "createdat": "2014-01-24T13:48:14",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Oto",
        "id": "52dd6b9bb0d86d6e45e39c12",
        "createdat": "2014-01-20T19:31:55",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Doheem",
        "id": "52dc1b91b0d86d4eb8e47c61",
        "createdat": "2014-01-19T19:38:09",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Web devel",
        "id": "52d83365b0d86d40cfa29012",
        "createdat": "2014-01-16T20:30:45",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Linux",
        "id": "52d6d61ab0d86d36ded5fe85",
        "createdat": "2014-01-15T13:40:26",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "WOT",
        "id": "52d6aaa2b0d86d2e0cacdcc1",
        "createdat": "2014-01-15T10:34:58",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Important",
        "id": "52d6aa06b0d86d2e0cacdcbf",
        "createdat": "2014-01-15T10:32:22",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Friends",
        "id": "52d4dc81b0d86d1d853416a9",
        "createdat": "2014-01-14T01:43:13",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Len",
        "id": "52c5bf930dbd8514667d3c3b",
        "createdat": "2014-01-02T20:35:47",
        "_cls": "Stack"
    },
    {
        "owner": null,
        "title": "Floating",
        "id": "52ad96c60dbd8511767ce868",
        "createdat": "2013-12-15T12:47:18",
        "_cls": "Stack"
    }
];

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

/*
Post.findOne({_id: 123})
.populate('postedBy')
.exec(function(err, post) {
    // do stuff with post
});
*/