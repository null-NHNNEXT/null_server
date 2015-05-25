"use strict";

var UserProvider = function(dbManager) {
	this.dbManager = dbManager;
}

// --------------------------------
// Register user or modify pen name
//
// Params :
//	user {
//		"boardId" : "board id",
//		"writerId" : "writer id",
//		"penName" : "new penName, should be unique penName"
//	}
//
//	callback.error = new Error("error message") or null;
// --------------------------------
UserProvider.prototype.register = function(user, callback) {
	if (! user.boardId) return callback(new Error("boardId not specified"));
	if (! user.writerId) return callback(new Error("writerId not specified"));
	if (! user.penName) return callback(new Error("penName not specified"));

	this.dbManager.getCollection("users"+user.boardId, function(error, collection) {
		if (error) return callback(error);

		collection.findOne({
			"penName" : user.penName
		}, function(error, result) {
			//console.log("[DEBUG] result " + JSON.stringify(result));
			if (error) return callback(error);
			if ( result && result._id != user.writerId )
				return callback(new Error("duplicated penName"));

			collection.update(
				{ "_id" : user.writerId },
				{ "_id" : user.writerId, "penName" : user.penName },
				{ "upsert" : true },
				function(error, result) { callback(error, result); }
			);
		});
	});
};

// --------------------------------
// Find user
//
// Params :
//	boardId = "board id",
//	writerId = "writer id"
//
//	callback.error = new Error("error message") or null;
//	callback.result = {
//		"_id" : "writer id",
//		"penName" : "pen name"
//	}
// --------------------------------
UserProvider.prototype.findById = function(boardId, writerId, callback) {
	if (! boardId) return callback(new Error("boardId not specified"));
	if (! writerId) return callback(new Error("writerId not specified"));

	this.dbManager.getCollection("users"+boardId, function(error, collection) {
		if (error) return callback(error);
		
		collection.findOne({
			"_id" : writerId
		}, function(error, result) { callback(error, result); });
	});
};

exports.UserProvider = UserProvider;

