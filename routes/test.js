'use strict';

var express = require('express');
var router = express.Router();

// UserProviderTest
var UserProvider = require('../models/userprovider').UserProvider;
var userProvider = new UserProvider('localhost', 27017);

var registerTest = function(req, res, next) {
	var title = "RegisterTest";

	userProvider.register( "testBoard", "testWriter", "testPenName", function(err) {
		if (!err) {
			console.log( title + " #1 passed" );
		} else {
			console.log( title + " #1 failed" );
		}

		userProvider.register( "testBoard", "testWriter", "testPenName", function(err) {
			if (!err) {
				console.log( title + " #2 passed" );
			} else {
				console.log( title + " #2 failed" );
			}
		});

		userProvider.register( "testBoard", "testWriter2", "testPenName", function(err) {
			if (err) {
				console.log( title + " #3 passed" );
			} else {
				console.log( title + " #3 failed" );
			}
		});
	});

	if (next)
		next(req, res, next);
};

router.get('/all', function(req, res, next) {
	registerTest(req, res, function() {
		res.sendStatus(202);
	});
});

router.get('/register', function(req, res, next) {
	registerTest(req, res, function() {
		res.sendStatus(202);
	});
});

module.exports = router;

