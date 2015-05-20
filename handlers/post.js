"use strict";
var mongo = require('mongodb');
var DBManager = require('../models/DBManager').DBManager;
var PostProvider = require('../models/postprovider.js').PostProvider;

var postProvider = new PostProvider(DBManager);

var BoardPermissionErr = { code : 401, msg : "Does not have Board Permission" },
		PostPermissionErr = { code : 403, msg : "Does not have Post Permission" };

exports.findBefore = function(req, res, token) {
	var getNum = 10;

	// --------------------------------
	// Modified by JinWoo Lee (2015.05.13)
	// --------------------------------
	var boardId = token.board;
	var category = "all";
	// var category = req.params.category;
	var postId = req.params._id;
	console.log("findBefore: postId(" + postId + ")");

	postProvider.findBefore(boardId, category, postId, getNum, function(err, result) {
		if(err) {
			console.log("ERROR : " + err);
			res.json({error:err});
		} else {
//			console.log('Success: ' + JSON.stringify(result));
			res.json({error:null, result:result});
		}
	});
}


exports.create = function(req, res, token) {
	console.log('handler/post.create');

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	if (!body.title) {
		res.status(400).json({ "error" : "Bad Request - no title" });
		return;
	}

	var post = {
		boardId: token.board,
		writerId: token.uuid,
		title: body.title,
		contents: body.contents,
		image: body.image
	};

	postProvider.save(post, function(err, result) {
		if (err) {
			console.log("ERROR : " + err);
			res.json({error:err});
		} else {
//			console.log('Success: ' + JSON.stringify(result));
			res.json({error:null, result:result});
		}
	});
};

exports.read = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;
	console.log('Retrieving post: ' + _id);

	postProvider.findById(boardId, _id, function(err, result) {
		if (err) {
			console.log("ERROR : " + err);
			res.json({error:err});
		} else {
			console.log('Success: ' + JSON.stringify(result));
			res.json({error:null, result:result});
		}
	});
};

exports.update = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;
	console.log('Updating post: ' + _id);

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	if (!body.title) {
		res.status(400).json({ "error" : "Bad Request - no title" });
		return;
	}

	var post = {
		boardId: token.board,
		writerId: token.uuid,
		title: body.title,
		contents: body.contents,
		image: body.image
	};

	if(post) {
		postProvider.save(post, function(err, result) {
			if (err) {
				console.log("ERROR : " + err);
				res.json({error:err});
			} else {
				console.log('Success: ' + JSON.stringify(result));
				res.json({error:null, result:result});
			}
		});
	}
};

exports.delete = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;
	console.log('Deleting post: ' + _id);

	postProvider.deleteById(boardId, _id, function(err, result) {
		if (err) {
			console.log("ERROR : " + err);
			res.json({error:err});
		} else {
			console.log('Success: ' + JSON.stringify(result));
			res.json({error:null, result:result});
		}
	});
};

exports.addComment = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;

	var comment = {
		writerId : "TestWriterID",
		penName : "TestPenname",
		contents : "Test contents"
	};

	postProvider.addComment(boardId, _id, comment, function(err, result) {
		if (err) {
			console.log("ERROR : " + err);
			res.json({error:err});
		} else {
			console.log("Success: " + JSON.stringify(result));
			res.json({error: null});
		}
	});
};

exports.removeComment = function(req, res, token) {
	var _id = req.params._id;
	var _commentId = req.params._commentId;
	var boardId = token.board;

	postProvider.removeComment(boardId, _id, _commentId, function(err, result) {
		if (err) {
			console.log("ERROR : " + err);
			res.json({error:err});
		} else {
			console.log("Success: " + JSON.stringify(result));
			res.json({error: null});
		}
	});
};

function checkBoardAvailablity(token, boardId, callback) {
	var availableBoard = token.board;
	if(availableBoard == boardId) {
		callback();
	} else {
//		var err_p = "Does not have Board Permission";
		var err_p = 401;
		callback(err_p);
	}
}

function checkPostAvailablity(token, boardId, postId, callback) {
	checkBoardAvailablity(token, boardId, function(err) {
		if (err) {
			console.log("PERROR : " + err);
			callback(BoardPermissionErr);
		} else {
			postProvider.findById(boardId, postId, function(err, result) {
				if (err) {
					console.log("DBERROR : " + err);
					callback(err);
				} else {
					console.log('Success: ' + JSON.stringify(result.writerId));
					console.log('tokenId: ' + token.uuid);
					if(token.uuid == result.writerId) {
						callback();
					} else {
//						var err_p = "Does not have Post Permission";
						callback(PostPermissionErr);
					}
				}
			});
		}
	});
}

function handleError(res, err) {
	res.status(err.code);
	res.json(err);
//	res.send(err.code + " : " + err.msg);
}


function includes(array, target) {
	for(var i = 0; i < array.length; i++) {
		if(array[i] == target) {
			return true;
		}
	}
	return false;
}
