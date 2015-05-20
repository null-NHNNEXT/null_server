"use strict";

var mongo = require('mongodb');
var DBManager = require('../models/DBManager').DBManager;
var UserProvider = require('../models/userprovider.js').UserProvider;
var jwt = require('jwt-simple');

var userProvider = new UserProvider(DBManager);

var _iss = 'NEXT_NULL';
var _secret = 'mysecret';

exports.register = function(req, res) {
	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;
	console.log(body);
	var uuid = body.writerId;
	var boardId = body.boardId;
	var penName = body.penName;
	userProvider.register( boardId, uuid, penName, function(err) {
		if (err) {
			console.log(err.name + ": " + err.message);
			res.status(409).json({ "error": err.message });
			return;
		}

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

			if (!decoded.board) {
				console.log("[parseToken] Error: board name undefined or null");
				res.status(500).json({ "error" : "Internal Service Error - cannot find board" });
				return;
			}

			if (!checkValid(decoded.uuid, new Date(decoded.exp), decoded.valid)) {
				res.status(401).json({ "error" : "Unauthorized" });
				return;
			}

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
		exp: expires,
		valid: expires % 1000 + uuid.substring(0,6)
	};

	console.log('creating Token of uuid : ' + uuid);
	console.log('body:\n' + body.valid);
	var token = jwt.encode(body, _secret);
	console.log('token :' + token);

	callback(token);
};


function parseToken(token, callback) {
	var decoded = jwt.decode(token, _secret);
	callback(decoded);
}
