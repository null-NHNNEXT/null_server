'use strict';

var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');

var express = require('express');
var router = express.Router();

router.get('/resetTestData', function(req, res, next) {
	User.remove({}, function(error) { if (error) console.log(error); });
	User.create(
		{ deviceId: "test_device_id_dummy", penName: "안익태" },
		{ deviceId: "test_device_id_dummy", penName: "안중근" },
		{ deviceId: "test_device_id_dummy", penName: "안창호" }
	, function(error) {
		if (error) return res.send(error);
		res.sendStatus(202);
	});
});

router.get('/viewAll', function(req, res, next) {
	User.find({}, function(error, users) {
		console.log(users);
	});
	Post.find({}, function(error, posts) {
		console.log(posts);
	});
	Comment.find({}, function(error, comments) {
		console.log(comments);
	});

	res.sendStatus(202);
});

module.exports = router;

