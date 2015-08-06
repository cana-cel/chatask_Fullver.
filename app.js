var express = require('express');
var app = express();
var routes = require('./routes');
var sio = require('./sio');
var debug = require('debug')('chatask');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var date = require('date-utils');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//ビューの設定
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//req.bodyを使うための設定
app.use(bodyParser.urlencoded({extended: true}));

//javascript, cssがおいてあるフォルダ
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/javascript'));

//セッションの設定
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        db: 'session',
        host: 'localhost'
        //保存期間
        //clear_interval: 60 * 60
    }),
    cookie: {
        httpOnly: false,
        //Cookieの有効期限
        maxAge: 60 * 60 * 1000
    }
}))

//セッションに値がなければ/loginにリダイレクト
var loginCheck = function(req, res, next) {
    //セッションがあるとき
    if(req.session.session) {
        res.redirect('/logon');
    }
    //セッションがないとき
    else{
        next();
    }
}

//exportsで定義した関数をget
app.get('/', loginCheck, routes.index);
app.get('/login', loginCheck,　routes.login);
app.get('/create', routes.create);
app.get('/logon', routes.logon);
app.post('/logon', routes.logon);
app.post('/create_done', routes.create_done);
app.get('/logout', function (req, res) {
    req.session.destroy();
    console.log('deleted session');
    res.redirect('/');
})

app.set('port',  process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

sio(server);
