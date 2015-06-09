"use strict";

var mongo = require('mongodb');
var dbManager = require('../models/DBManager').mainDB;
var readDb = require('../models/DBManager').readDB;
var UserProvider = require('../models/userprovider.js').UserProvider;
var jwt = require('jwt-simple');

var userProvider = new UserProvider(dbManager, readDb);

var _iss = 'NEXT_NULL';
var _secret = 'mysecret';

function errorHandler(res, code, error) {
	console.log("Error: " + error.message);
	res.status(code).json({ "error": error.message });
}

exports.register = function(req, res) {
	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;
	console.log(body);
	var uuid = body.writerId;
	var boardId = body.boardId;
	var penName = body.penName;
	userProvider.register( {
		"boardId" : boardId,
		"writerId" : uuid,
		"penName" : penName
	}, function(error) {
		if (error) return errorHandler(res, 409, error);

		createToken(uuid, boardId, function(token) {
			console.log(token);
			res.json({ "error": null, "result": token });
		});
	});
};

exports.next = function(handler) {
	return function(req, res) {
		var token = req.get('Authorization');
		parseToken(token, function(decoded) {
			console.log("token :" + JSON.stringify(decoded));

			if (!decoded.board)
				return errorHandler(res, 500, new Error("Internal Service Error - cannot find board"));

			if (!checkValid(decoded.uuid, new Date(decoded.exp), decoded.valid))
				return errorHandler(res, 401, new Error(Unauthorized));

			handler(req, res, decoded);
		});
	};
};

function checkValid(uuid, exp, valid) {
	return valid == (exp % 1000 + uuid.substring(0,6));
}

function createToken(uuid, boardId, callback) {
	var expires = new Date();
	expires.setDate(expires.getDate() + 7);

	var body = {
		iss: 'NEXT_NULL',
		uuid: uuid,
		board: boardId,
		redis: 0,
		mongo: 0,
		exp: expires,
		valid: expires % 1000 + uuid.substring(0,6)
	};

	var token = jwt.encode(body, _secret);

	callback(token);
};


function parseToken(token, callback) {
	var decoded = jwt.decode(token, _secret);
	callback(decoded);
}

