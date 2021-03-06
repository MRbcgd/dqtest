var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var socketio = require('socket.io'); //CONNECT WITH CLIENT
var mysql = require('mysql');
/*
var conn = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'qkrcjfgud12',
    database: 'server_monitoring',
    multipleStatements: true
});
*/

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'pchpch',
    password: 'cs2017!Q@W#E$R',
    database: 'server_monitoring',
    multipleStatements: true
});
conn.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + conn.threadId);
});

var client_socket = require('./conn_socket.js'); //CONNECT WITH MASTER
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();

const dstkey = 'a52ER2###@DFDDQQ$FBPF!#)'; //NOT YET
const login_token = 'login1'; //NOT YET
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
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
    login_token: login_token,
    svccd: null,
    query_type: 'direct',
    dstkey: dstkey
  },
  input: {},
  output: {},
  error: {
    code: null,
    mesg: null
  }
};

io.on("connection", function(socket) {

  socket.on('client', function(data) {
    console.log(data);
  });

  socket.on('list', function(data) {
    packet.head.svccd = data;
    client_socket.emit('wm', packet); //DIRECT QUERY WEB TO MASTER
    console.log('#####################');
    console.log('Send packet to master');
    console.log(packet);
  });

  socket.on('clientQuery', function(data) {
    if (data === 'usage_status') {
      var cpu_usage = 'select us cpup from agentcpu where svrkey = ? order by idate desc limit 1;';
      var mem_usage = 'select us memp from agentmemory where svrkey =? order by idate desc limit 1;';
      var net_usage = 'select rcv, snd from agenttcp where svrkey =? order by idate desc limit 1;';
      var disk_usage = 'select us diskp from agentdisk where svrkey =? order by idate desc limit 1;';
      var qnum = 'select qnum from agentipcq where svrkey = ? order by idate desc limit 1;';
      var sql = cpu_usage + mem_usage + net_usage + disk_usage + qnum;
      conn.query(sql, [dstkey, dstkey, dstkey, dstkey, dstkey], function(err, result) {
        if (err) throw err;

        io.sockets.emit('serverSent', result);
        console.log('####################');
        console.log('DB QUERY')
      });
    } else if (data === 'agenttcp') {
        /*
        limit의 개수는 /proc/net/dev의 이더넷 개수를 config폴더에 저장한뒤 이를 이용하여 n*24로 구한다.
        후에 수정한다.(임시)
        */
        var sql = 'select count(*) count from (select eth from agenttcp group by eth) t1;';
        sql += 'select eth from agenttcp group by eth;';
        sql += 'select t1.a idate, t1.b rcv, t1.c snd, t1.e eth from (select substr(idate,1,13) a, max(rcv) b, max(snd) c, max(idate) d, eth e from agenttcp group by substr(idate,1,13),eth order by substr(idate,1,13) desc) t1 left outer join agenttcp t2 on t1.d=t2.idate and t1.e=t2.eth order by t1.a desc limit 48;';
        //LAST MEMORY DATA
        sql += 'select * from agenttcp order by idate desc limit 2;';
        conn.query(sql, function(err, result) {
          if (err) {
            throw err;
          }

          io.sockets.emit('serverSent', result);
          console.log('####################');
          console.log('DB QUERY')
          // console.log(result);
        })
    } else if (data === 'agentcpu') {
      var sql = 'select t1.a idate, t1.b us, t2.prcs1_nm, t2.prcs1_us, t2.prcs2_nm, t2.prcs2_us, t2.prcs3_nm, t2.prcs3_us from (select substr(idate,1,13) a, max(us) b, max(idate) c from agentcpu group by substr(idate,1,13) order by substr(idate,1,13) desc) t1 left outer join agentcpu t2 on t1.c=t2.idate order by t1.a desc limit 24;';
      //LAST CPU DATA
      var sql = sql += 'select * from agentcpu order by idate desc limit 1;';
      conn.query(sql, function(err, result) {
        if (err) {
          throw err;
        }

        io.sockets.emit('serverSent', result);
        console.log('####################');
        console.log('DB QUERY')
        // console.log(result);
      })
  } else if (data === 'agentmemory') {
      var sql = 'select t1.a idate, t1.b us, t1.c swap from (select substr(idate,1,13) a, max(us) b, max(swap) c, max(idate) d from agentmemory group by substr(idate,1,13) order by substr(idate,1,13) desc) t1 left outer join agentmemory t2 on t1.d=t2.idate order by t1.a desc limit 24;';
      //LAST MEMORY DATA
      var sql = sql += 'select * from agentmemory order by idate desc limit 1;';
      conn.query(sql, function(err, result) {
        if (err) {
          throw err;
        }

        io.sockets.emit('serverSent', result);
        console.log('####################');
        console.log('DB QUERY')
        // console.log(result);
      })
  } else if (data === 'agentdisk') {
      var sql = 'select t1.a idate, t1.b us from (select substr(idate,1,13) a, max(us) b, max(idate) c from agentdisk group by substr(idate,1,13) order by substr(idate,1,13) desc) t1 left outer join agentdisk t2 on t1.c = t2.idate order by t1.a desc limit 24;';
      //LAST DISK DATA
      var sql = sql += 'select * from agentdisk order by idate desc limit 1;';
      conn.query(sql, function(err, result) {
        if (err) {
          throw err;
        }

        io.sockets.emit('serverSent', result);
        console.log('####################');
        console.log('DB QUERY')
        // console.log(result);
      })
  }
  else {
      var sql = 'SELECT * FROM ' + data + ' WHERE svrkey = ?;';
      conn.query(sql, [dstkey], function(err, result) {
        if (err) {
          throw err;
        }
        io.sockets.emit('serverSent', result);
        console.log('####################');
        console.log('DB QUERY')
        // console.log(result);
      })
    }
  });

  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
});

client_socket.on('mw', function(message) {
  console.log('#####################');
  console.log('Receive packet from master');
  console.log(message);
  if (message.error.code !== 0) { //REPRESENT PACKET
    client_socket.emit('wm', packet);
    console.log('Send packet to master: ERR- REPRESENT');
  } else {
    io.sockets.emit('message', message.output);
  }
});


module.exports = app;
