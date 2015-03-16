'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	boardId: String,
	writerId: Schema.Types.ObjectId,
	time: Date,
	title: String,
	contents: String
});

module.exports = mongoose.model('Post', PostSchema);

