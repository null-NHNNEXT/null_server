"use strict";
var ObjectID = require('mongodb').ObjectID;

var objectIdFromDate = function(date) {
	return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

var dateFromObjectId = function(objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};

var PostProvider = function(dbManager) {
	this.db = dbManager.db;
}

PostProvider.prototype.getCollection = function(boardId, callback) {
	this.db.collection('posts'+boardId, function(err, collection) {
		if (err) {
			callback(err);
		} else {
			callback(null, collection);
		}	
	});
};


PostProvider.prototype.findBefore = function(boardId, category, postId, num, callback) {
	if(!postId) {
		postId = objectIdFromDate(new Date()); 
	}

	console.log("PostProvider.findBefore: postId(" + postId + ")");
	
	this.getCollection(boardId, function(err, collection) {
		if (err) {
			callback(err);
			return;
		}

		collection.find({
			_id : { $lt : new ObjectID(postId) }
		}).sort({ $natural: -1 }).limit(num).toArray(function(err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, results);
			}
		});
	});
};

PostProvider.prototype.findById = function(boardId, postId, callback) {
	this.getCollection(boardId, function(err, collection) {
		if(err) {
			callback(err);
			return;
		}

		collection.findOne({
			_id : ObjectID.createFromHexString(postId)
		}, function(err, result) {
			if(err) {
				callback (err);
			} else {
				callback(null, result);
			}
		});
	});
};

PostProvider.prototype.deleteById = function(boardId, postId, callback) {
	this.getCollection(boardId, function(err, collection) {
		if(err) {
			callback(err);
			return;
		}

		collection.remove({
			_id : ObjectID.createFromHexString(postId)
		}, function(err, result) {
			if(err) {
				callback (err);
			}	else {
				callback(null, result);
			}
		});
	});
};

PostProvider.prototype.addComment = function(boardId, postId, comment, callback) {
	this.getCollection(boardId, function(err, collection) {
		if (err) {
			callback (err);
			return;
		}

		collection.update({
			_id : ObjectID.createFromHexString(postId)
		}, {
			"$push" : { comments : comment }
		}, function (err, post) {
			if(error) {
				callback(error);
			} else {
				callback(null , post);
			}
		});
	});
};

PostProvider.prototype.removeComment = function(boardId, postId, comment, callback) {
	// TODO: not implemented yet
	callback(null);
};
 
PostProvider.prototype.save = function(post, callback) {
  this.getCollection(post.boardId, function(err, collection) {
    if(err) {
			callback(err);
		} else {
			post.ts = new Date();
			delete post.writerId;
			post.penName = "hihihi";	// TODO: temporary dummy
			if ( typeof(post.image) == "undefined" ) {
				post.image = false;
			}
			post.comments = [];
			//post = [post];
			collection.insert(post, function() {
				callback(null, post);
      });
    }
  });
};



exports.PostProvider = PostProvider;
