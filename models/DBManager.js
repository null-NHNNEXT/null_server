"use strict";
var Db = require('mongodb').Db;
var Server = require ('mongodb').Server;

var DBManager = function(dbName, host, port) {
	this.db = new Db(dbName, new Server(host, port, {auto_reconnect: true}));
	this.db.open(function(err) {
		if (!err) {
			console.log("DBManager : Connected to '" + dbName + "' database");
		} else {
			console.log(err);
		}
	});
};

DBManager.prototype.getCollection = function(name, callback) {
	this.db.collection(name, function(err, collection) {
		if (!err) {
			callback(null, collection);
		} else {
			callback(err);
		}
	});
};

exports.DBManager = new DBManager("null_db", "localhost", 27017);

