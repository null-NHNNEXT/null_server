"use strict";
var ObjectID = require('mongodb').ObjectID;

var objectIdFromDate = function(date) {
	return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

var dateFromObjectId = function(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

var PostProvider = function(dbManager) {
	this.dbManager = dbManager;
}
 
// --------------------------------
// Save new article, or update article
//
// Params :
//	post {
//		"_id" : "null/undefined(new post) or post id",
//		"title" : "title",
//		"contents" : "contents"
//	}
//
//	callback.error = new Error("error message") or null
// --------------------------------
PostProvider.prototype.save = function(boardId, post, callback) {
	if (! post) return callback(new Error("post is null"));

	this.dbManager.getCollection("posts"+boardId, function(error, collection) {
		if (error) return callback(error);

		post._id = new ObjectID(post._id || null);
		post.ts = new Date();
		post.comments = [];
		collection.update(
			{ "_id" : post._id },
			post,
			{ "upsert" : true },
			function(error, result) { callback(error, result); }
		);
	});
};

// --------------------------------
// Find recent articles, or articles before specific article ID.
//
// Params :
//	boardId = "board id";
//	postId = "null(recent articles) or specific article ID""
//
//	callback.error = new Error("error message") or null
//	callback.results = [
//		(post data),
//		(post data),
//		(post data)
//	]
// --------------------------------
PostProvider.prototype.findBefore = function(boardId, postId, num, callback) {
	this.dbManager.getCollection("posts"+boardId, function(error, collection) {
		if (error) return callback(error);

		collection.find({
			_id : { $lt : new ObjectID(postId) }
		}).sort({ $natural: -1 }).limit(num).toArray(function(error, results) {
			callback(error, results);
		});
	});
};

PostProvider.prototype.findById = function(boardId, postId, callback) {
	this.dbManager.getCollection("posts"+boardId, function(error, collection) {
		if (error) return callback(error);

		collection.findOne({
			_id : ObjectID.createFromHexString(postId)
		}, function(error, result) { callback(error, result); });
	});
};

PostProvider.prototype.deleteById = function(boardId, postId, callback) {
	this.dbManager.getCollection("posts"+boardId, function(error, collection) {
		if (error) return callback(error);

		collection.remove({
			_id : ObjectID.createFromHexString(postId)
		}, function(error, result) { callback(error, result); });
	});
};

PostProvider.prototype.addComment = function(boardId, postId, comment, callback) {
	this.dbManager.getCollection("posts"+boardId, function(error, collection) {
		if (error) return callback(error);

		collection.update({
			_id : ObjectID.createFromHexString(postId)
		}, {
			"$push" : { comments : comment }
		}, function (error, post) { callback(error, result); });
	});
};

PostProvider.prototype.removeComment = function(boardId, postId, comment, callback) {
	// TODO: not implemented yet
	callback(null);
};


exports.PostProvider = PostProvider;
