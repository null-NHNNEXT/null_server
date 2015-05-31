"use strict"

var amqp = require("amqplib");
var mqtt = require("mqtt");

var mqttConnection = mqtt.connect("mqtt://localhost" );

mqttConnection.on("connect", function() {
	amqp.connect("amqp://localhost").then(function(conn) {
		var q = "post";

		return conn.createChannel().then(function(ch) {
			var ok = ch.assertQueue(q, {durable:false});

			return ok.then(function(_qok) {
				return ch.consume(q, function(msg) {
					var message = JSON.parse(msg.content.toString());
					console.log("[amqp] Received '%s'", JSON.stringify(message));
					mqttConnection.publish("board" + message.boardId,  message.title);
				}, {noAck: true});
			});
		});
	});
});

