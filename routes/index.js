//modelを実行
var model = require('../model');
var Group = model.Group;
var Member = model.Member;
var Chat = model.Chat;
var express = require('express');
var app = express();
var date = require('date-utils');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//exports.hoge で　hoge を外で使えるようにしている

exports.index = function (req, res) {
	res.render('index');
};

exports.create = function (req, res) {
	res.render('create', {title: 'New Entry'});
};

exports.login = function (req, res) {
	res.render('login', {title: 'New Entry'})
};

exports.create_done = function (req, res) {
	var newGroup = new Group(req.body);
	//新しいグループを作成
	newGroup.save(function (err, items) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('create_done', {items: newGroup["groupname"]});
		}
	})
}

exports.logon = function (req, res) {
	//セッションを保持しているとき
	if (req.session.session) {
		name = req.session.session;
		console.log(req.session);
		console.log('^^');
		res.render('logon_ok', { title: 'Hello, world', items: name});		
	}
	//セッションがないとき
	else {
		var newGroup = new Group(req.body);
		var newMember = new Member(req.body);
		//グループ名とパスワードの判定
		Group.find({groupname: newGroup["groupname"], password: newGroup["password"]}, function (err, items) {
			if (err) {
				console.log(err);
			}
			else {
				//一致するものがないとき…ログイン失敗
				if (items.length == 0) {
					res.render('logon_ng');
					console.log(items);
				}
				//一致したとき…ログイン成功
				else{
					//メンバーがすでに登録されているか？
					Member.find({name: newMember["name"], groupname: newMember["groupname"]}, function (err, items) {
						if (err) {
							console.log(err);
						}
						else {
							// 登録されてない
							if (items.length == 0) {
								newMember.save(function (err) {
									if (err) {
										console.log(err);
									}
								});
							}
						}
					})
					//セッションスタート
					req.session.session = newMember["name"];
					res.render('chat');
					console.log('started session');
					Chat_part(newMember);
				}
			}
	});}

}

function Chat_part(newMember) {
	//socketio
	var userCount = 0;
	var roomList = new Object();
	var jsonBoth = {};
	var userList = new Object(); //ユーザーの名前とsocketidを紐づけるもの

	io.on('connection', function(socket){
		console.log('a user connected');

		userCount++;
		io.sockets.emit("port", userCount);

		updateRoomList(roomList);
		function updateRoomList(roomList) {
			if(roomList) { io.sockets.emit("roomList", roomList); }
		}

		function enter() {
			socket.name = newMember["name"];
			var roomName = newMember["groupname"];
			if (!roomList[roomName]) {
				createRoom(roomName);
			} else if(roomList[roomName]) {
				var roomUserCount = roomList[roomName]
				enterRoom(roomName);
			}
		}

		socket.on("sendMessage", function(data) {
			var roomName = socket.roomName;
			var now = nowDate()
			io.sockets.to(roomName).emit("recieveMessage", {
				message: data.message,
				name: socket.name,
				date: now
			});
			var chat = new Chat();
			chat.message = data.message;
			chat.name = socket.name;
			chat.date = now;
			chat.room = socket.roomName;
			chat.save(function(err) {
				if(err) { console.log(err); }
			});
		});

		socket.on("deleteDB", function() {
			socket.emit('dropDB');
			User.remove({  __v : 0 }, function(err, result){
	    			if (err) {
	        			res.send({'error': 'An error has occurred - ' + err});
	    			} else {
	        			console.log('UserRemoveSuccess: ' + result + ' document(s) deleted');
	    			}
	 		});
			Chat.remove({  __v : 0 }, function(err, result){
	    			if (err) {
	        			res.send({'error': 'An error has occurred - ' + err});
	    			} else {
	        			console.log('CharRemoveSuccessSuccess: ' + result + ' document(s) deleted');
	    			}
	 		});
		})

		socket.on("disconnect", function() {
			userCount--;
			var roomName = socket.roomName;
			if (roomName) {
				roomList[roomName]--;
				socket.leave(roomName);
				io.sockets.to(roomName).emit("recieveMessage", {
					message: "退出",
					name: socket.name,
					date: nowDate()
				});
				updateRoomList(roomList);
			}
			console.log("ウェブサイトから退室：現在" + userCount + "人");
			io.sockets.emit("port", userCount);
		});

		function nowDate() {
			var now = new Date()
			return now.toFormat("YYYY/MM/DD HH24:MI");
		}

		function createRoom(roomName) {
			roomList[roomName] = 1;
			console.log("create ChatRoom : " + roomName + " ( " + roomList[roomName] + "members )");
			joinRoom(roomName);
		}

		function enterRoom(roomName) {
			roomList[roomName]++;
			console.log("\"" + socket.name + "\" enter ChatRoom : " + roomName + " ( " + roomList[roomName] + "members )");
			joinRoom(roomName);
		}

		function joinRoom(roomName) {
			socket.roomName = roomName;
			socket.join(roomName);
			Chat.find({room:socket.roomName},function(err, docs) {
	  			socket.emit('openMessage', docs);
	  			io.sockets.to(roomName).emit("recieveMessage", {
					message: "入室",
					name: socket.name,
					date: nowDate()
				});
	  		});
			updateRoomList(roomList);
			// var user = new User();
			// user.name = socket.name;
			// user.room = socket.roomName;
			// user.save(function(err) {
			// 	if(err) { console.log(err); }
			// });
			// User.find({room:socket.roomName},function(err, docs) {
	  // 			io.sockets.to(roomName).emit("roomMember", docs);
	  // 		});
		}

	});

}
