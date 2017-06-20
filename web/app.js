var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var socketio = require('socket.io');//CONNECT WITH CLIENT

var client_socket = require('./conn_socket.js');//CONNECT WITH MASTER
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

const login_token = 'test';//NOT YET
const dstkey = 'a52ER2###@DFDDQQ$FBPF!#)';//NOT YET

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: '7?z-qddk-l-45',
  resave: false,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var io = socketio();
app.io = io;

var packet = {
  head: {
    login_token : login_token,
    svccd : null,
    query_type : 'direct',
    dstkey: dstkey
  },
  input: {},
  output: {},
  error: {
    code: null,
    mesg: null
  }
};

io.on("connection",function(socket){

  socket.on('client',function(data){
    console.log(data);
  });
  socket.on('list', function(data){
    packet.head.svccd = data;
    if (data === 'stat_info') {
      client_socket.emit('stat_info_wm', packet);//DIRECT QUERY WEB TO MASTER
    }
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);
  })

})


module.exports = app;
