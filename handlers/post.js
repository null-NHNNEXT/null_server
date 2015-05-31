"use strict";

var mongo = require('mongodb');
var amqp = require('amqplib');
var dbManager = require('../models/DBManager').mainDB;
var UserProvider = require('../models/userprovider.js').UserProvider;
var PostProvider = require('../models/postprovider.js').PostProvider;

var userProvider = new UserProvider(dbManager);
var postProvider = new PostProvider(dbManager);

function errorHandler(res, code, error) {
	console.log("Error: " + error.message);
	console.log(error.trace);
	res.status(code).json({ "error": error.message });
}

var amqpCh;
function amqpChannel(next) {
	if (amqpCh)
		return next(null, amqpCh);

	amqp.connect('amqp://localhost').then(function(conn) {
		conn.createChannel().then(function(ch) {
			amqpCh = ch;
			next(null, ch);
		});
	});
}

exports.findBefore = function(req, res, token) {
	var getNum = 10;

	var boardId = token.board;
	var postId = req.params._id;
	console.log("findBefore: boardId(" + boardId + "), postId(" + postId + ")");

	postProvider.findBefore(boardId, postId, getNum, function(error, result) {
		if (error) return errorHandler(res, 500, error);

		res.json({ "error": null, "result": result });
	});
}


exports.create = function(req, res, token) {
	console.log("handler/post.create");

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	if (! body.title) return errorHandler(res, 400, new Error("Bad Request - no title" ));

	userProvider.findById(token.board, token.uuid, function(error, result) {
		if (error) return errorHandler(res, error);

		var post = {
			"title" : body.title,
			"contents" : body.contents,
			"penName" : result.penName,
			"image" : body.image || null
		};

		postProvider.save(token.board, post, function(error, result) {
			if (error) return errorHandler(res, error);

			res.json({ "error": null, "result": result });

			console.log("Post saved : " + JSON.stringify(result));
			// Now send notification to rabbitMQ
			amqpChannel(function(error, ch) {
				var q = "post";
				var message = JSON.stringify({
					"boardId" : token.board,
					"writerId" : token.uuid,
					"title" : post.title
				});

				ch.assertQueue(q, {durable: false}).then(function(_qok) {
					ch.sendToQueue(q, new Buffer(message));
				});
			});
		});
	});

};

exports.read = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;
	console.log("handler/post.read : id(" + _id + ")");

	postProvider.findById(boardId, _id, function(error, result) {
		if (error) return errorHandler(res, error);

		res.json({ "error": null, "result": result });
	});
};

exports.update = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;
	console.log("handler/post.update : id(" + _id + ")");

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	if (! body.title) return errorHandler(res, 400, new Error("Bad Request - no title" ));

	userProvider.findById(token.board, token.uuid, function(error, result) {
		if (error) return errorHandler(res, error);

		var post = {
			"_id" : _id,
			"title" : body.title,
			"contents" : body.contents,
			"penName" : result.penName,
			"image" : body.image || null
		};

		postProvider.save(token.board, post, function(error, result) {
			if (error) return errorHandler(res, 500, error);

			res.json({ "error": null, "result": result });
		});
	});
};

exports.delete = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;
	console.log('Deleting post: ' + _id);

	postProvider.deleteById(boardId, _id, function(error, result) {
		if (error) return errorHandler(res, 500, error);

		res.json({ "error": null, "result": result });
	});
};

exports.addComment = function(req, res, token) {
	var _id = req.params._id;
	var boardId = token.board;

	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	userProvider.findById(token.board, token.uuid, function(error, result) {
		if (error) return errorHandler(res, 500, error);

		var comment = {
			"contents" : body.contents,
			"penName" : result.penName
		};

		postProvider.addComment(boardId, _id, comment, function(error, result) {
			if (error) return errorHandler(res, 500, error);

			res.json({ "error": null, "result": result });
		});
	});
};

exports.removeComment = function(req, res, token) {
	var _id = req.params._id;
	var _commentId = req.params._commentId;
	var boardId = token.board;

	postProvider.removeComment(boardId, _id, _commentId, function(error, result) {
		if (error) return errorHandler(res, 500, error);

		res.json({ "error": null, "result": result });
	});
};

