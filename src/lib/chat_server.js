/************** SocketIO APIs **************
	
	// send to current request socket client
 	socket.emit('message', "this is a test");

 	// sending to all clients, include sender
 	io.sockets.emit('message', "this is a test");

 	// sending to all clients except sender
 	socket.broadcast.emit('message', "this is a test");

 	// sending to all clients in 'game' room(channel) except sender
 	socket.broadcast.to('game').emit('message', 'nice game');

  	// sending to all clients in 'game' room(channel), include sender
 	io.sockets.in('game').emit('message', 'cool game');

 	// sending to individual socketid
 	io.sockets.socket(socketid).emit('message', 'for your eyes only');	

**********************************************/

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};



function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	var name = 'Guest' +  guestNumber;
	nickNames[socket.id] = name;
	//console.log('From chat_server: ', socket.id);
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	namesUsed.push(name);
	return guestNumber + 1;
}

function joinRoom(socket, room) {
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {room: room});
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});

	var usersInRoom = io.sockets.clients(room);
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for (var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id;
			if (userSocketId != socket.id) {
				if (index > 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += '.';
		socket.emit('message', {text: usersInRoomSummary});
	}
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function(name) {
		if (name.indexOf('Guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});
		} else {
			if (namesUsed.indexOf(name) == -1) {
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNameIndex];
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is now known as ' + name + '.'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'That name is already in use.'
				});
			}
		}
	});
}

function handleMessageBroadcasting(socket) {
	socket.on('message', function(message) {
		 // sending to all clients except sender
		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + ':' + message.text
		});
	});
}

function handleRoomJoining(socket) {
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

function handleClientDisconnection(socket) {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	});
}

exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level', 1);
	request = require('http');

	io.sockets.on('connection', function (socket) {
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);

		//io.sockets.manager.rooms will return a room list
		//Clients send this request intermittenly, so it will response intermittenly.
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
			//console.log("Rooms response from chat_server.js");
		});
		handleClientDisconnection(socket, nickNames, namesUsed);
	});
};