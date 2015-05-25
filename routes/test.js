'use strict';

var express = require('express');
var dbManager = require('../models/DBManager').testDB;
var UserProvider = require('../models/userprovider').UserProvider;

var router = express.Router();
var userProvider = new UserProvider(dbManager);

var resetDB = function(next) {
	dbManager.db.dropDatabase(function(err, result) {
		next(err, result);
	});
};

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

