//データベースに接続
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/nodestudy_login');

//文字列長が0より大きいか？
function validator (v) {
	return v.length > 0;
}

//グループスキーマ
var Group = new mongoose.Schema({
    groupname: {type: String, validate: [validator, "Empty Error"]},
    password: {type: String, validate: [validator, "Empty Error"]},
    project: {type: String, validate: [validator, "Empty Error"]},
    leader: {type: String},
    created: {type: Date, default: Date.now}
});

//メンバースキーマ
var Member = new mongoose.Schema({
    name: {type: String, validate: [validator, "Empty Error"]},
    groupname: {type: String, validate: [validator, "Empty Error"]}
});

//チャットスキーマ
var Chat = new mongoose.Schema({ 
    message: {type: String, validate: [validator, "Empty Error"]},
    name: {type: String, validate: [validator, "Empty Error"]},
    date: {type: String, validate: [validator, "Empty Error"]},
    groupname: {type: String, validate: [validator, "Empty Error"]}
});

//タスクスキーマ
var Task = new mongoose.Schema({
    groupname: {type: String},
    name: {type: String},
    text: {type: String},
    date: {type: Date}
});

//mongodb上では、postsというコレクション名で登録される
//exportsに渡して、外から使えるようにする
//db.model('モデルネーム', 引っ張ってくるスキーマ)
exports.Group = db.model('Group', Group);
exports.Member = db.model('Member', Member);
exports.Chat = db.model('Chat', Chat);
exports.Task = db.model('Task', Task);