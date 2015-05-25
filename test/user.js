"use strict";

var assert = require("assert");
var dbManager = require('../models/DBManager').testDB;
var UserProvider = require('../models/userprovider').UserProvider;

var userProvider = new UserProvider(dbManager);

describe("User", function() {
	before(function(done) {
		dbManager.getConnection(function(error, connection) {
			//console.log("[DEBUG] Before test : Drop database");
			connection.dropDatabase(done);
		});
	});

	describe("#register()", function() {
		var boardId = "testBoard";
		var writerId = "testWriter";
		var penName = "Test penname";

		it("should accept new penName", function(done) {
			userProvider.register({
				"boardId" : boardId,
				"writerId" : writerId,
				"penName" : penName
			}, done);
		});

		it("should accept that penName with that writerId", function(done) {
			userProvider.register({
				"boardId" : boardId,
				"writerId" : writerId,
				"penName" : penName
			}, done);
		});

		it("should not accept that panName with another writerId", function(done) {
			userProvider.register({
				"boardId" : boardId,
				"writerId" : "anotherWriter",
				"penName" : penName
			}, function(error) {
				assert.ifError(! error);
				done();
			});
		});

		it("should accept new penName with that writerId", function(done) {
			userProvider.register({
				"boardId" : boardId,
				"writerId" : writerId,
				"penName" : "New penname"
			}, done);
		});

		it("should find & return user info (with new penname)", function(done) {
			userProvider.findById( boardId, writerId, function(error, result) {
				if (error) return done(error);

				assert.equal(result.penName, "New penname");
				done(error);
			});
		});
	});
});

