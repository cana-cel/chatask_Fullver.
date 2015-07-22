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

	//空白のとき、チームを作らない
	if(newGroup["groupname"] == "" || newGroup["password"]　== "") {
		res.render('create_ng');
	}
	else {
		//新しいグループを作成
		newGroup.save(function (err, items) {
			if (err) {
				console.log(err);
			}
			else {
				res.render('create_done', {groupname: newGroup["groupname"], project: newGroup["project"]});
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

		//console.log(req.session);
		//console.log('^^');

		res.render('logon', {name: name, groupname: groupname, projectname: projectname});		

	}
	//セッションがないとき
	else {
		var newGroup = new Group(req.body);
		var newMember = new Member(req.body);
		console.log(newGroup["project"]);
		//グループ名とパスワードの判定
		Group.find({groupname: newGroup["groupname"], password: newGroup["password"]}, function (err, items) {
			console.log("^^");
			console.log(items);
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
					GroupName = newMember["groupname"];
					exports.MemberName = newMember["name"];
					exports.GroupName = newMember["groupname"];
					res.render('logon', {name: newMember["name"], groupname: newMember["groupname"], projectname: ProjectName});
					console.log('started session');
					//console.log(GroupName);
				}
			}
	});}

}

