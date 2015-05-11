var express = require('express');
var router = express.Router();

var auth = require('../handlers/auth');
var post = require('../handlers/post');

var AUTHer = function(callback) {
	return function(req, res) { auth.parse(req, res, callback); };
}

router.get('/', function(req, res) {
	res.render('index', { title : 'NEXT HDP TEAM NULL APIs' }); 
});

router.post('/auth/register', auth.new);
router.post('/auth/addBoard/:boardId', function(req, res) {});

router.get('/list/:boardId/:category/before/:_id', AUTHer(post.findBefore));
router.get('/list/:boardId/:category', AUTHer(post.findBefore));

router.get('/post/:boardId/:_id', AUTHer(post.read));
router.post('/post/:boardId', AUTHer(post.create));
router.put('/post/:boardId/:_id', AUTHer(post.update));
router.delete('/post/:boardId/:_id', AUTHer(post.delete));


module.exports = router;
