"use strict";
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app);

var mongoose = require('mongoose');

//localhostのnode_task_memoのデータベースに接続。
var db = mongoose.connect('mongodb://localhost/node_task_memo');
//メモのスキーマを宣言。
var MemoSchema = new mongoose.Schema({
  group:{type:Number},
  text:{type:String},
  date:{type:Date}
});
//スキーマからモデルを生成。
var Memo = db.model('memo', MemoSchema);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection',function(socket){
  Memo.find(function(err,items){
    if(err){console.log(err);}
    //接続したユーザにメモのデータを送る。
    socket.emit('create',items);
  });
  //createイベントを受信した時、データベースにMemoを追加する。
  //memoDataは{text:String,position:{left:Number,top:Number}}の型
  socket.on('create',function(memoData){
    //モデルからインスタンス作成
    var memo = new Memo(memoData);
    //データベースに保存。
    memo.save(function(err){
      if(err){ return; }
      socket.broadcast.json.emit('create',[memo]);
      socket.emit('create',[memo]);
    });
  });

  //update-textイベントを受信した時、Memoのtextをアップデートする。
  socket.on('update-text',function(data){
    Memo.findOne({_id:data._id},function(err,memo){
      if(err || memo === null){return;}
      memo.text = data.text;
      memo.save();
      socket.broadcast.json.emit('update-text',data);
    });
  });
  //removeイベントを受信した時、データベースから削除する。
  socket.on('remove',function(data){
    Memo.findOne({_id:data._id},function(err,memo){
      if(err || memo === null){return;}
      memo.remove();
      socket.broadcast.json.emit('remove',data);
    });
  });
});
