'use strict';

// --------------------------------
//  Test test
// --------------------------------
var authKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJORVhUX05VTEwiLCJ1dWlkIjoiYWJlYmNjNWUtNzY5My00ODYwLWFmMDAtMWM3YjgzMDAxMjkyIiwiYm9hcmQiOiIxMjM0NSIsImV4cCI6IjIwMTUtMDYtMDdUMDg6MTQ6MDcuNjE1WiIsInZhbGlkIjoiNjE1YWJlYmNjIn0.0l5YxmavpMhLI9BQ21ti7jEFBWucq7YCWR7n86lpZgo";

test( '[POST] /api/auth/register', function( assert ) {
	assert.expect(3);
	var done = assert.async();
	var postData = {
		"writerId" : "abebcc5e-7693-4860-af00-1c7b83001292",
		"boardId" : "12345",
		"penName" : "JinWoo"
	};
	var postData2 = {
		"writerId" : "ffffffff-7693-4860-af00-1c7b83001292",
		"boardId" : "12345",
		"penName" : "JinWoo"
	};

	$.when( function() {
		return $.ajax({
			url : '/api/auth/register',
			type : 'POST',
			contentType : 'application/json; charset=utf-8',
			data : JSON.stringify(postData),
			datatype : 'json'
		});
	}).then(function(data) {
		console.log('auth/register : ' + JSON.stringify(data));
		assert.equal( data.error, null, 'error should be null' );

		return $.ajax({
			url : '/api/auth/register',
			type : 'POST',
			contentType : 'application/json; charset=utf-8',
			data : JSON.stringify(postData),
			datatype : 'json'
		});
	}).then(function(data) {
		console.log('auth/register : ' + JSON.stringify(data));
		assert.equal( data.error, null, 'error should be null' );

		return $.ajax({
			url : '/api/auth/register',
			type : 'POST',
			contentType : 'application/json; charset=utf-8',
			data : JSON.stringify(postData2),
			datatype : 'json'
		});
	}).fail(function(data) {
		console.log('auth/register : ' + JSON.stringify(data));
		assert.notEqual( data.error, null, 'error should not be null' );

		done();
	});
});

test( '[POST] /api/post', function( assert ) {
	assert.expect(2);
	var done = assert.async();
	var postData = {
		"title" : "Test title",
		"contents" : "Test contents",
		"image" : null
	};

	$.when( function() {
		return $.ajax({
			url : '/api/post',
			headers : { "Authorization" : authKey },
			type : 'POST',
			contentType : 'application/json; charset=utf-8',
			data : JSON.stringify(postData),
			datatype : 'json'
		});
	}).then(function(data) {
		console.log('auth/post : ' + JSON.stringify(data));
		assert.equal( data.error, null, 'error should be null' );
		assert.notEqual( data.result._id, null, '_id should not be null' );
		done();
	});
});

test( '[GET] /api/list', function( assert ) {
	assert.expect(2);
	var done = assert.async();
	var postData = { category : 'solace' };

	$.when( $.ajax({
		url : '/api/list',
		headers : { "Authorization" : authKey },
		type : 'GET'
	}) ).then(function(data) {
		console.log('auth/post : ' + JSON.stringify(data));
		assert.equal( data.error, null, 'error should be null' );
		assert.notEqual( data.result.length, 0, 'should return any post' );
		done();
	});
});

