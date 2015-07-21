//ソケット接続の要求
var socketio = io.connect('http://localhost:3000');

console.log("client ok");
		
		//接続が確立
		socketio.on("connect", function() {
			//var userName = "a";
			//var roomName = "b";
			// //enterイベント発火、データ送信
			// socketio.emit("enter",{
			// 	userName: userName,
			// 	roomName: roomName
			// });
			//var name = <%- JSON.stringify(name) %>;
			//var groupname = <%- JSON.stringify(groupname) %>;
			addRoomInfo("" + "さんは" + "" + "にログインしました");
		});

		// function enterRoom() {
		// 	var userName = "task";
		// 	var roomName = "Task";
		// 	socketio.emit("enter",{
		// 		userName: userName,
		// 		roomName: roomName
		// 	});
		// 	addRoomInfo(userName + "さんは" + roomName + "に入室しました。");
		// }

		socketio.on("openMessage", function(dataArray) {
			if(dataArray.length == 0) { return; }
			else {
				$('#message_input').empty();
				dataArray.forEach(function(data) {
					addMessage(data);
				});
			}
		});

		socketio.on("recieveMessage", function(data) {
			addMessage(data);
		});

		socketio.on("dropDB", function() {
			$("#message").empty();
			$("#member").empty();
		})

 		socketio.on("roomList", function(roomList){
 			if (roomList) {
 				$('#roomList').text("");
				for (var roomName in roomList) {
 					var message =  roomName + "：" + roomList[roomName] + "人";
 					var domMeg = document.createElement('div');
 					domMeg.innerHTML = message;
 					$('#roomList').append(domMeg);
 				}
 			}
 		});

 		socketio.on("port", function(userCount) {
 			var message = "（現在" + userCount  + "人がオンライン）";
 			updateOnlineUserCount(message);
 		});

 		socketio.on("roomMember", function(userArray) {
 			if(userArray.length == 0) {
 				return;
 			} else {
				$('#roomMember').empty();
				userArray.forEach(function(data) {
					var user =  data.name;
 					var domMeg = document.createElement('div');
 					domMeg.innerHTML = user;
 					$('#member').append(domMeg);
				});
			}
 		});

		socketio.on("disconnect", function(data) { });

		function sendMessage() {
			var now = new Date();
			var nowHour = now.getHours();
			var nowMin = now.getMinutes();
			if(nowHour < 10){ nowHour = "0"+nowHour; }
			if(nowMin < 10){ nowMin = "0"+nowMin; }
			socketio.emit("sendMessage", {
				message: $('#message_input').val(),
			});
			$('#message_input').val('').focus();
		}

		function addMessage(data) {
			var domMeg = document.createElement('div');
			domMeg.innerHTML = data.date + ' [' + data.name + '] ' + data.message;
			$('#message').append(domMeg);
		}

		function addRoomInfo(info) {
			var domMeg = document.createElement('div');
			domMeg.innerHTML = info;
			$('#roomInfo').text("");
			$('#roomInfo').append(domMeg);
		}

		function updateOnlineUserCount(info) {
			var domMeg = document.createElement('div');
			domMeg.innerHTML = info;
			$('#onlineUserCount').text("");
			$('#onlineUserCount').append(domMeg);
		}

		function deleteDB() {
			socketio.emit("deleteDB");
		}