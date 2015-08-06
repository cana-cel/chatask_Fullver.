//modelを実行
var model = require('../model');
var Group = model.Group;
var Member = model.Member;
var Chat = model.Chat;

var GroupName = "";
var ProjectName = "";

//exports.hoge で　hoge を外で使えるようにしている

exports.index = function (req, res) {
	res.render('index');
};

exports.create = function (req, res) {
	res.render('create');
};

exports.login = function (req, res) {
	res.render('login');
};

exports.create_done = function (req, res) {
	var newGroup = new Group(req.body);
	var newMember = new Member(req.body);

	//空白のとき、チームを作らない
	if(newGroup["groupname"] == "" || newGroup["password"]　== "") {
		res.render('create_ng');
	}
	else {
		newGroup["leader"] = req.body.name[0];
		//新しいグループを作成
		newGroup.save(function (err, items) {
			if (err) {
				console.log(err);
			}
			else {
				//保存用
				var names = req.body.name;
				var len = req.body.name.length;
				console.log(len);
				//メンバー情報を保存
				for (var i = 0; i < len; i++) {
					req.body.name = names[i];
					//console.log(req.body);
					newMember.save(function (err, items) {
						if(err) {
							console.log(err);
						}
					});
				}
				console.log(newGroup);
				console.log(newMember);
				res.render('create_done', {groupname: newGroup["groupname"], project: newGroup["project"], leader: newGroup["leader"]});
			}
		})
	}
}

exports.logon = function (req, res) {
	//セッションを保持しているとき
	if (req.session.session) {
		//表示用
		name = req.session.session;
		groupname = GroupName;
		projectname = ProjectName;
		res.render('logon', {name: name, groupname: groupname, projectname: projectname});
	}
	//セッションがないとき
	else {
		var newGroup = new Group(req.body);
		var newMember = new Member(req.body);
		//グループ名とパスワードの判定
		Group.find({groupname: newGroup["groupname"], password: newGroup["password"]}, function (err, items) {
			items.forEach(function (item) {
				ProjectName = item.project;
			})
			if (err) {
				console.log(err);
			}
			else {
				//一致するものがないとき…ログイン失敗
				if (items.length == 0) {
					res.render('logon_ng');
				}
				//チーム名とパスワードが一致したとき
				else {
					//メンバー名の判定
					Member.find({name: newMember["name"], groupname: newMember["groupname"]}, function (err, items) {
						//login失敗
						if (items.length == 0) {
							res.render('logon_ng', {word: "^^"});
						}
						//login成功
						else {
						//セッションスタート
							req.session.session = newMember["name"];
							GroupName = newMember["groupname"];
							exports.MemberName = newMember["name"];
							exports.GroupName = newMember["groupname"];
							res.render('logon', {name: newMember["name"], groupname: newMember["groupname"], projectname: ProjectName});
							console.log('started session');
							//console.log(GroupName);
						}
					})
				}
			}
	});}

}

