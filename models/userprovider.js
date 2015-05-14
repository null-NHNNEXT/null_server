'use strict';

var Db = require('mongodb').Db;
var Connection = require ('mongodb').Connection;
var Server = require ('mongodb').Server;
var BSON = require ('mongodb').BSON;
var ObjectID = require ('mongodb').ObjectID;

var UserProvider = function(host, port) {
	this.db = new Db('null_db', new Server(host, port, {auto_reconnect: true}));
	this.db.open(function(err) {
		if (!err) {
			console.log("app.js : Connected to 'null_db' database");
		} else {
			console.log (err);
		}
	});
}

UserProvider.prototype.getCollection = function(boardId, callback) {
	this.db.collection('user' + boardId, function(err, collection) {
		if (err) {
			callback(err);
		} else {
			callback(null, collection);
		}	
	});
};

UserProvider.prototype.register = function(boardId, writerId, penName, callback) {
	if (!writerId) {
		callback(new Error('writerId not spicified'));
		return;
	}

	if (!boardId) {
		callback(new Error('boardId not spicified'));
		return;
	}

	if (!penName) {
		callback(new Error('penName not spicified'));
		return;
	}

	this.getCollection(boardId, function(err, collection) {
		if (err) {
			callback(err);
			return;
		}

		collection.findOne({
			"penName" : penName
		}, function(err, result) {
			if ( err ) {
				callback(err);
			} else if ( result && result._id != writerId ) {
				callback(new Error('duplicated penName'));
			} else {
				collection.update({
					_id: writerId
				}, {
					_id : writerId,
					"penName" : penName
				}, { "upsert" : true }, function() {
					callback(null);
				});
			}
		});
	});
};

exports.UserProvider = UserProvider;

