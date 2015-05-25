"use strict";

var assert = require("assert");
var dbManager = require('../models/DBManager').testDB;
var PostProvider = require('../models/postprovider').PostProvider;

var postProvider = new PostProvider(dbManager);

describe("Post", function() {
	var boardId = "testBoard";
	var writerId = "testWriter";
	var penName = "testPenName";
	var posts = [];
	var postsCount = 20;

	for (var i = 0; i < postsCount; ++i) {
		posts.push({
			"title" : "Test title #" + i,
			"contents" : "Test Contents #" + i,
			"penName" : penName,
		});
	}

	before(function(done) {
		dbManager.getConnection(function(error, connection) {
			connection.dropDatabase(done);
		});
	});

	describe("#save()", function() {
		var id;

		it("should accept all posts", function(done) {
			var recursion = function(next, remain) {
				if (remain.length == 0) return done();

				postProvider.save(boardId, remain[0], function(error, result) {
					if (error) return done(error);

					next(next, remain.slice(1));
				});
			};

			recursion(recursion, posts);
		});

		it("should return all post", function(done) {
			postProvider.findBefore(boardId, null, postsCount + 100, function(error, result) {
				assert.equal(result.length, postsCount);
				id = result[0]._id;	// save id for next test
				done(error);
			});
		});

		it("should update post with _id set", function(done) {
			var updatedPost = {
				"_id" : id,	// saved id from previous test
				"title" : "New test title",
				"contetns" : "New test Contents",
				"penName" : "New PenName"
			};

			postProvider.save(boardId, updatedPost, function(error) {
				if (error) return done(error);

				postProvider.findBefore(boardId, null, postsCount + 100, function(error, result) {
					assert.equal(result.length, postsCount);
					assert.equal(result[0]._id, updatedPost._id.toHexString());
					assert.equal(result[0].title, updatedPost.title);
					assert.equal(result[0].contents, updatedPost.contents);
					assert.equal(result[0].penName, updatedPost.penName);
					done(error);
				});
			});
		});
	});
});

