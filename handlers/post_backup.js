var mongo = require('mongodb');

var PostProvider = require('./models/postprovider.js').PostProvider;

/*
var DBServer = mongo.Server;
var Db = mongo.Db
var BSON = mongo.BSONPure;
var ObjectId = require('mongodb').ObjectID;

db = new Db('null_db', new DBServer('localhost', 27017, {auto_reconnect: true}));
db.open(function (err, db) {
	if(!err) { console.log("app.js : Connected to 'null_db' database"); }
});
*/

var postProvider = new PostProvider('localhost', 27017);

exports.create = function(req, res) {
	var body = req.body;
	body = typeof body === 'string' ? JSON.parse(body) : body;

	console.log('!!!');
	console.log(body);

	var now = new Date(); 

	var post = {
//		id: now.getTime() + body.writerId.substring(0,6),
//		ts: now, 
		boardId: body.boardId,
		writerId: body.writerId,
		title: body.title,
		contents: body.contents,
//		comment: [] 
	};

	if(post.title == null) {
		post = null;
	}

	db.collection('posts', function(err, collection) {
		collection.insert(post, {safe:true}, function(err, result) {
			if (err) {
				console.log("ERROR : " + err);
				res.json({error:err});
			} else {
				console.log('Success: ' + JSON.stringify(result));
				res.json({error:null, result:result});
			}
		});
	});	
};

exports.read = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving post: ' + id);
	db.collection('posts', function(err, collection) {
		collection.findOne({'id':id}, function(err, item) {
			res.send(item);
		});
	});
};

exports.update = function(req, res, token) {
	var id = req.params.id;


	res.send(token);

};

