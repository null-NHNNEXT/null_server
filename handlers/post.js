var mongo = require('mongodb');
var PostProvider = require('../models/postprovider.js').PostProvider;

var postProvider = new PostProvider('localhost', 27017);

var BoardPermissionErr = { code : 401, msg : "Does not have Board Permission" },
		PostPermissionErr = { code : 403, msg : "Does not have Post Permission" };

exports.findBefore = function(req, res, token) {
	var getNum = 20;

	// --------------------------------
	// Modified by JinWoo Lee (2015.05.13)
	// --------------------------------
	var boardId = "12314";
	// var boardId = req.params.boardId;
	var category = "all";
	// var category = req.params.category;
	var postId = req.params._id;
	console.log("findBefore: postId(" + postId + ")");

	checkBoardAvailablity(token, boardId, function(errno) {
		if(errno) {
			console.log("ERROR : " + errno);
			handleError(res, errno);
		} else {
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
	});
}


exports.create = function(req, res, token) {
	console.log('handler/post.create');

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	var post = {
		boardId: req.params.boardId,
		writerId: token.uuid,
		title: body.title,
		contents: body.contents,
		image: body.image
	};

	if(post.title == null) {
		post = null;
	}

	checkBoardAvailablity(token, post.boardId, function(errno) {
		if(errno) {
			console.log("ERROR : " + errno);
			handleError(res, errno);
		} else {	
			if(post) {
				postProvider.save(post, function(err, result) {
					if (err) {
						console.log("ERROR : " + err);
						res.json({error:err});
					} else {
		//				console.log('Success: ' + JSON.stringify(result));
						res.json({error:null, result:result});
					}
				});
			}
		}
	});
};

exports.read = function(req, res, token) {
	var _id = req.params._id;
	var boardId = req.params.boardId;
	console.log('Retrieving post: ' + _id);


	checkBoardAvailablity(token, boardId, function(errno) {
		if(errno) {
			console.log("ERROR : " + errno);
			handleError(res, errno);
		} else {
			postProvider.findById(boardId, _id, function(err, result) {
				if (err) {
					console.log("ERROR : " + err);
					res.json({error:err});
				} else {
					console.log('Success: ' + JSON.stringify(result));
					res.json({error:null, result:result});
				}
			});
		}
	});
};

exports.update = function(req, res, token) {
	var _id = req.params._id;
	var boardId = req.params.boardId;
	console.log('Updating post: ' + _id);

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	var post = {
		boardId: body.boardId,
		writerId: token.uuid,
		title: body.title,
		contents: body.contents,
		image: body.image
	};

	if(post.title == null) {
		post = null;
	}

	checkPostAvailablity(token, boardId, _id, function(errno) {
		if(errno) {
			console.log("ERROR : " + errno);
			handleError(res, errno);
		} else {
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
		}
	});
};

exports.delete = function(req, res, token) {
	var _id = req.params._id;
	var boardId = req.params.boardId;
	console.log('Deleting post: ' + _id);

	checkPostAvailablity(token, boardId, _id, function(errno) {
		if(errno) {
			console.log("ERROR : " + errno);
			handleError(res, errno);
		} else {
			postProvider.deleteById(boardId, _id, function(err, result) {
				if (err) {
					console.log("ERROR : " + err);
					res.json({error:err});
				} else {
					console.log('Success: ' + JSON.stringify(result));
					res.json({error:null, result:result});
				}
			});
		}
	});
};

function checkBoardAvailablity(token, boardId, callback) {
	var availableBoards = token.boards.toString().split(',');
	if(includes(availableBoards, boardId)) {
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
