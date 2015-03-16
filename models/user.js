'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	deviceId: String,
	penName: String
});

module.exports = mongoose.model('User', UserSchema);

