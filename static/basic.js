var context = {
	localStream: null,
	room: null,
	token: null
};

function basicInit() {
	context.localStream = Erizo.Stream({audio: true, video: true, data: true, videoSize: [640, 480, 640, 480]});
	requestToken("user", "presenter", gotToken);
}

function requestToken(username, role, callback) {
	var data = {
		username: username,
		role: role
	};
	//$.post("/token/", JSON.stringify(data), callback);
	$.ajax({
		type: "POST",
		url: "/token/",
		data: JSON.stringify(data),
		success: callback,
		contentType: "application/json",
		dataType: "json"
	});
}

function gotToken(data) {
	console.log("got token = " + data.token);
	context.token = data.token;
	context.room = Erizo.Room({token: context.token});

	context.localStream.addEventListener("access-accepted", localStreamAccepted);
	context.localStream.init();
}
var localStreamAccepted = function () {
	var subscribeToStreams = function (streams) {
		for (var index in streams) {
			var stream = streams[index];
			if (context.localStream.getID() != stream.getID()) {
				context.room.subscribe(stream);
			}
		}
	};

	context.room.addEventListener("room-connected", function (roomEvent) {
		console.log("room-connected");
		context.room.publish(context.localStream, {maxVideoBW: 300});
		subscribeToStreams(roomEvent.streams);
	});

	context.room.addEventListener("stream-subscribed", function (streamEvent) {
		console.log("stream-subscribed");
		var stream = streamEvent.stream;
		var div = document.createElement("div");
		div.setAttribute("style", "width: 320px; height: 240px;");
		div.setAttribute("id", "test" + stream.getID());

		document.body.appendChild(div);
		stream.show("test" + stream.getID());
	});

	context.room.addEventListener("stream-added", function (streamEvent) {
		console.log("stream-added");
		var streams = [];
		streams.push(streamEvent.stream);
		subscribeToStreams(streams);
	});

	context.room.addEventListener("stream-removed", function (streamEvent) {
		var  stream = streamEvent.stream;
		if (stream.elementID !== undefined) {
			var element = document.getElementById(stream.elementID);
			document.body.removeChild(element);
		}
	});

	context.room.connect();
	context.localStream.show("myVideo");
};