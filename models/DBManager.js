"use strict";
var Db = require('mongodb').Db;
var Server = require ('mongodb').Server;

var DBManager = function(dbName, host, port) {
	this.dbName = dbName;
	this.host = host;
	this.port = port;
};

DBManager.prototype.getConnection = function(callback) {
	var _this = this;
	if (_this.dbConnection)
		return callback(null, _this.dbConnection);

	var db = new Db(_this.dbName, new Server(_this.host, _this.port, {auto_reconnect: true}));

	//console.log("[DEBUG] DBManager : Connecting to '" + _this.dbName + "'");
	db.open(function(error, dbConnection) {
		if (error) return callback(error);

		//console.log("[DEBUG] DBManager : Connected to '" + _this.dbName + "'");
		_this.dbConnection = dbConnection;
		callback(null, dbConnection);
	});
};

DBManager.prototype.getCollection = function(name, callback) {
	this.getConnection(function(error, dbConnection) {
		if (error) return callback(error);

		dbConnection.collection(name, function(error, collection) {
			if (error) return callback(error);

			callback(null, collection);
		});
	});
};

exports.mainDB = new DBManager("null_db", "localhost", 27017);
exports.testDB = new DBManager("test_db", "localhost", 27017);

