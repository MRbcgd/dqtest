process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

var http = require('http');
var ip = require('ip');
var io = require('socket.io');
var session = require('express-session');
var mysql = require('mysql');

const port = 52273;
const host ='127.0.0.1';

const dstkey = 'a52ER2###@DFDDQQ$FBPF!#)';
const svrkey = 'a52ER2###@DFDDQQ$FBPF!#)';
const login_token = 'login1';


 // var conn = mysql.createConnection({
 //     host: 'localhost',
 //     user: 'pchpch',
 //     password: 'cs2017!Q@W#E$R',
 //     database: 'server_monitoring',
 //     multipleStatements: true
 // });

var conn = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'qkrcjfgud12',
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

var server = http.createServer();

server.listen(port, function () {
  console.log('Server Running at http://' + host + ':' + port);
});
io = io.listen(server);

var func_socket = require('./func_socket.js');

io.sockets.on('connection', function(socket) {

  console.log('The socket network is connected');

  func_socket.ip_check(socket);//IP CHECK

  socket.on('join', function (message) {
    console.log('Socket room created');
    socket.join(message)//PRIVATE COMMUNICATION
  });

  //DIRECT QUERY WEB TO MASTER: SYSTEM INFORMATION
  socket.on('wm', function (message) {
    console.log('####################'); console.log('Receive packet from web'); console.log(message);

    console.log('####################');
    if ( message.head.dstkey === svrkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(svrkey).emit('ma', message);

      console.log('Send packet to agent');
    } else {//NO SERVER
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in(login_token).emit('mw', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    };
    console.log(message);
  });

  //DIRECT QUERY AGENT TO MASTER: SYSTEM INFORMATION
  socket.on('am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === dstkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(login_token).emit('mw', message);
      console.log('Send packet to web'); console.log(message);
    } else {//INCORRECT SVRKEY
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in(svrkey).emit('ma', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    }

  });

// DB_QUERY
//#########################################################################################################
//#########################################################################################################
//#########################################################################################################
  socket.on('db_query', function (message) {

    console.log('####################'); console.log('Receive packet from agent'); console.log(message);
    if ( message.head.svrkey === svrkey) {
      //CPU - CPU
      if ( message.head.svccd === 'stat_prcs') {
        var sql = 'INSERT INTO agentcpu(svrkey, idate, us, prcs1_nm, prcs1_us, prcs2_nm, prcs2_us, prcs3_nm, prcs3_us) VALUES (?,?,?,?,?,?,?,?,?);';

        conn.query(sql ,[
          svrkey, message.output.cpu.date, message.output.cpu.us,
          message.output.cpu.prcs1_nm, message.output.cpu.prcs1_us,
          message.output.cpu.prcs2_nm, message.output.cpu.prcs2_us,
          message.output.cpu.prcs2_nm, message.output.cpu.prcs2_us
        ], function(err){
          if(err){
            throw err;
          }
          console.log('####################'); console.log('DB QUERY: Insert data to table')
        })
      };
      //USAGE - MEMORY
      if ( message.head.svccd === 'usage_mem') {
        var sql = 'INSERT INTO agentmemory(svrkey, idate, us, swap) VALUES (?,?,?,?);';

        conn.query(sql ,[
          svrkey, message.output.memory.date, message.output.memory.us, message.output.memory.swap
        ], function(err){
          if(err){
            throw err;
          }
          console.log('####################'); console.log('DB QUERY: Insert data to table')
        })
      };
      //NETWORK - TCP
      if ( message.head.svccd === 'usage_tcp') {

        var sql = 'INSERT INTO agenttcp(svrkey, idate, eth, rcv, snd) VALUES (?,?,?,?,?);';

        conn.query(sql ,[
          svrkey,
          message.output.tcp.date,
          message.output.tcp.eth,
          message.output.tcp.rcv,
          message.output.tcp.snd
        ], function(err){
          if(err){
            throw err;
          }
          console.log('####################'); console.log('DB QUERY: Insert data to table')
        })
      };

      //IPCQ
      if (message.head.svccd === 'stat_ipcq') {
        var sql = 'INSERT INTO agentipcq(svrkey, idate, qkey, qid, qnum, qbytes) VALUES (?,?,?,?,?,?);';
          conn.query(sql ,[
            svrkey,
            message.output.queue.date,
            Number(message.output.queue.key),
            message.output.queue.msqid,
            message.output.queue.qnum,
            message.output.queue.cbytes,

          ], function(err){
            if(err){
              throw err;
            }
            console.log('####################'); console.log('DB QUERY: Insert data to table')
          });



      };
      //DISK
      if (message.head.svccd === 'usage_disk') {
        var sql = 'INSERT INTO agentdisk(svrkey, idate, mount, total, us) VALUES (?,?,?,?,?);';

        conn.query(sql ,[
          svrkey,
          message.output.disk.date,
          message.output.disk.mount,
          message.output.disk.total,
          message.output.disk.us
        ], function(err){
          if(err){
            throw err;
          }
          console.log('####################'); console.log('DB QUERY: Insert data to table')
        });

      };
      message.error.code = 101; message.error.mesg = 'Correct packet data'; message.output = {};
    } else {
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
    }
    io.sockets.emit('db_query_result', message)
    console.log('Send packet to agent'); console.log(message);
  })

  //DISCONNECT
  socket.on('disconnect', function() {
    console.log('Client disconnected');
  });

});
