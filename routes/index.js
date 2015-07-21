//modelを実行
var model = require('../model');
var Group = model.Group;
var Member = model.Member;
var Chat = model.Chat;

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
		res.render('chat', { title: 'Hello, world', items: name});		
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
					exports.MemberName = newMember["name"];
					exports.GroupName = newMember["groupname"];
					res.render('chat', {name: newMember["name"], groupname: newMember["groupname"]});
					console.log('started session');					
				}
			}
	});}

}

