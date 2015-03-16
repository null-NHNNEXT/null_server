'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	postId: Schema.Types.ObjectId,
	writerId: Schema.Types.ObjectId,
	time: Date,
	conetents: String
});

module.exports = mongoose.model('Comment', CommentSchema);

