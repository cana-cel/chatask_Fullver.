//ソケット接続の要求
var socketio = io.connect('http://localhost:3000');

console.log("client ok");

		//接続が確立
		socketio.on("connect", function() {
		});

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

 		socketio.on("roomMember", function(data) {
 			var groupMembers = data.groupMembers;
 			var onlineMembers = data.onlineMembers;
 			console.log(groupMembers);
 			if(groupMembers.length == 0) {
 				return;
 			} else {
				$('#member').empty();
				groupMembers.forEach(function(data) {
					var member =  data.name;
 					var domMeg = document.createElement('div');
 					if (onlineMembers[member]) {
 						domMeg.innerHTML = "<i class=\"fa fa-comment\"></i><p> " + member +"</p>";
 					} else {
 						domMeg.innerHTML = "<i class=\"fa fa-comment-o\" style=\"color:#b0c4de\"></i><p style=\"color:#b0c4de\"> " + member +"</p>";
 					}
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
