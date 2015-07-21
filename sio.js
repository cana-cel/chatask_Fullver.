var express = require('express');
var app = express();
var session = require('express-session');
//var date = require('date-utils');
var model = require('./model');
var index = require('./routes/index');
//var http = require('http').Server(app);
var Group = model.Group;
var Member = model.Member;
var Chat = model.Chat;
var Task = model.Task;
//var newMember = newMember;

//socketio
console.log('Chat_part');
var userCount = 0;
var roomList = new Object();
var jsonBoth = {};
var userList = new Object(); //ユーザーの名前とsocketidを紐づけるもの

module.exports = sio;

function sio(server) {
    //socket.io
    var io = require('socket.io')(server);
    console.log("sio start");
    //var sio = io.listen(server);
    //sio.set('transports', [ 'websocket' ]);
    
    //接続が確立
    io.on('connection', function(socket){
        console.log('a user connected');

        //チャット部
        var MemberName = index.MemberName;
        var GroupName = index.GroupName;
        console.log(MemberName);

        userCount++;
        io.sockets.emit("port", userCount);

        updateRoomList(roomList);
        function updateRoomList(roomList) {
            if(roomList) { io.sockets.emit("roomList", roomList); }
        }

        //enterイベント、dataを受け取る

        socket.name = MemberName;
        var roomName = GroupName;
        if (!roomList[roomName]) {
            createRoom(roomName);
        } else if(roomList[roomName]) {
            var roomUserCount = roomList[roomName]
            enterRoom(roomName);
        }

        socket.on("sendMessage", function(data) {
            var roomName = socket.roomName;
            var now = nowDate();
            io.sockets.to(roomName).emit("recieveMessage", {
                message: data.message,
                name: socket.name,
                date: now
            });
            var chat = new Chat();
            chat.message = data.message;
            chat.name = socket.name;
            chat.date = now;
            chat.groupname = socket.roomName;
            chat.save(function(err) {
                if(err) { console.log(err); }
            });
        });

        //全削除
        // socket.on("deleteDB", function() {
        //     socket.emit('dropDB');
        //     User.remove({  __v : 0 }, function(err, result){
        //             if (err) {
        //                 res.send({'error': 'An error has occurred - ' + err});
        //             } else {
        //                 console.log('UserRemoveSuccess: ' + result + ' document(s) deleted');
        //             }
        //     });
        //     Chat.remove({  __v : 0 }, function(err, result){
        //             if (err) {
        //                 res.send({'error': 'An error has occurred - ' + err});
        //             } else {
        //                 console.log('CharRemoveSuccessSuccess: ' + result + ' document(s) deleted');
        //             }
        //     });
        // })

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
            //  if(err) { console.log(err); }
            // });
            Member.find({groupname: GroupName},function(err, docs) {
                  io.sockets.to(roomName).emit("roomMember", docs);
              });
        }

        //タスク部
        //タスクの表示
        Task.find({groupname: roomName}, function(err,items){
            if(err){console.log(err);}
            //接続したユーザにメモのデータを送る。
            socket.emit('display',items);
        });

        //createイベントを受信した時、データベースにTaskを追加する。
        //memoDataは{text:String,position:{left:Number,top:Number}}の型
        socket.on('create',function(data){
            var roomName = socket.roomName;
            var now = nowDate();
            io.sockets.to(roomName).emit("create_display", {
                text: data.text,
                name: socket.name,
                date: now,
                groupname: socket.roomName
            });
            var task = new Task();
            task.text = data.text;
            task.name = socket.name;
            task.date = now;
            task.groupname = socket.roomName;
            task.save(function(err) {
                if(err) { console.log(err); }
            });
            //モデルからインスタンス作成
            // var task = new Task(taskData);
            // //データベースに保存。
            // task.save(function(err){
            // if(err){ return; }
            // socket.broadcast.json.emit('create',[task]);
            // socket.emit('create',[task]);
            // });
        });

        //update-textイベントを受信した時、Memoのtextをアップデートする。
        socket.on('update-text',function(data){
            Task.findOne({_id:data._id},function(err,task){
            if(err || task === null){return;}
            task.text = data.text;
            task.save();
            socket.broadcast.json.emit('update-text',data);
            });
        });
        //removeイベントを受信した時、データベースから削除する。
        socket.on('remove',function(data){
            Task.findOne({_id:data._id},function(err,task){
            if(err || task === null){return;}
            task.remove();
            socket.broadcast.json.emit('remove',data);
            });
        });        

    });
}