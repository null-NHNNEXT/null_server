var mongo = require('mongodb');
var UserProvider = require('../models/userprovider.js').UserProvider;
var userProvider = new UserProvider('localhost', 27017);

var jwt = require('jwt-simple');

var _iss = 'NEXT_NULL';
var _secret = 'mysecret';

exports.new = function(req, res, next) {
	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;
	console.log(body);
	var uuid = body.writerId;
	var boardId = body.boardId;
	var penname = body.penName;
	userProvider.register( boardId, uuid, penName, function() {
		if (err) {
			console.log(err.name + ": " + err.message);
			res.status(409);
			res.json({ "error": err.message });
			return;
		}

		createToken(uuid, boardId, function(token) {
			console.log(token);
			res.json({ "error": null, "result": token });
		});
	});
//	next();
};

exports.parse = function(req, res, next) {
	var token = req.get('Authorization');
	parseToken(token, function(decoded) {
		if(checkValid(decoded.uuid, new Date(decoded.exp), decoded.valid)) {
			next(req, res, decoded);
		} else {
			res.send('error');
		}
	});
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
		boards: [12314, boardId],
		exp: expires,
		valid: expires % 1000 + uuid.substring(0,6)
	};

	console.log('creating Token of uuid : ' + uuid);
	console.log('body:\n' + body.valid);
	var token = jwt.encode(body, _secret);
	console.log('token :'+token);

	callback(token);
};


function parseToken(token, callback) {
	console.log("parseToken");
	var decoded = jwt.decode(token, _secret);
	console.log("parseToken3");
	console.log(decoded);

	callback(decoded);
}
