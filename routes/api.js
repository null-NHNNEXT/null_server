var express = require('express');
var auth = require('../handlers/auth');
var post = require('../handlers/post');

var router = express.Router();

router.get('/', function(req, res) {
	res.render('index', { title : 'NEXT HDP TEAM NULL APIs' }); 
});

router.post('/auth/register', auth.register);

router.get('/list', auth.next(post.findBefore));
router.get('/list/before/:_id', auth.next(post.findBefore));

router.post('/post', auth.next(post.create));
router.get('/post/:_id', auth.next(post.read));
router.put('/post/:_id', auth.next(post.update));
router.delete('/post/:_id', auth.next(post.delete));

router.post('/post/:_id/comment', auth.next(post.addComment));
router.delete('/post/:_id/comment/:_cid', auth.next(post.removeComment));

module.exports = router;

