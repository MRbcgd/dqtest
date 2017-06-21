var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var socketio = require('socket.io');//CONNECT WITH CLIENT
var mysql = require('mysql');
//
var conn = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'qkrcjfgud12',
    database: 'server_monitoring',
    multipleStatements: true
});
// var conn = mysql.createConnection({
//     host: 'localhost',
//     user: 'pchpch',
//     password: 'cs2017!Q@W#E$R',
//     database: 'server_monitoring',
//     multipleStatements: true
// });
conn.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + conn.threadId);
});

var client_socket = require('./conn_socket.js');//CONNECT WITH MASTER
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

const dstkey = 'a52ER2###@DFDDQQ$FBPF!#)';//NOT YET
const login_token = 'login1';//NOT YET
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
    client_socket.emit('wm', packet);//DIRECT QUERY WEB TO MASTER
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);
  });

  socket.on('clientQuery', function (data) {
    if (data === 'usage_status') {
      // var status;
      // var cpu_usage = 'select us cpup from agentcpu where svrkey = ? order by idate desc limit 1;';
      // var mem_usage = 'select us memp from agentmemory where svrkey =? order by idate desc limit 1;';
      // var net_usage = 'select rcv, snd from agenttcp where svrkey =? order by idate desc limit 1;';
      // var disk_usage = 'select us diskp from agentdisk where svrkey =? order by idate desc limit 1';
      // var qnum = 'select qnum from agentipcq where svrkey = ? order by idate desc limit 1;';
      //
      // conn.query(cpu_usage ,[ dstkey ], function(err, result){if(err) throw err; });
      // conn.query(mem_usage ,[ dstkey ], function(err, result){if(err) throw err;  });
      // conn.query(net_usage ,[ dstkey ], function(err, result){if(err) throw err; });
      // conn.query(disk_usage ,[ dstkey ], function(err, result){if(err) throw err; });
      // conn.query(qnum ,[ dstkey ], function(err, result){if(err) throw err; });
      // console.log(status);
      // io.sockets.emit('serverSent', status);
      // console.log('####################'); console.log('DB QUERY')
    }
    else if (data === 'agenttcp') {
      var sql = 'SELECT A.svrkey, A.idate, A.eth, A.rcv, A.snd, B.eth eth_v, B.rcv v_rcv, B.snd v_snd FROM agenttcp A LEFT OUTER JOIN agenttcp AS B ON A.idate = B.idate WHERE A.eth = ? AND A.eth <> B.eth AND A.svrkey = ?';
      conn.query(sql ,[ 'enp2s0',dstkey ], function(err, result){
        if(err){
          throw err;
        }
        io.sockets.emit('serverSent', result);
        console.log('####################'); console.log('DB QUERY')
        // console.log(result);
      })
    }
    else {
      var sql = 'SELECT * FROM ' + data + ' WHERE svrkey = ?;';
      conn.query(sql ,[ dstkey ], function(err, result){
        if(err){
          throw err;
        }
        io.sockets.emit('serverSent', result);
        console.log('####################'); console.log('DB QUERY')
        // console.log(result);
      })
    }
  });

  socket.on('disconnect', function () {
    console.log('User disconnected');
  });
});

client_socket.on('mw', function (message) {
  console.log('#####################'); console.log('Receive packet from master'); console.log(message);
  if ( message.error.code !== 0 ) {//REPRESENT PACKET
    client_socket.emit('wm', packet); console.log('Send packet to master: ERR- REPRESENT');
  } else {
    io.sockets.emit('message', message.output);
  }
});


module.exports = app;
