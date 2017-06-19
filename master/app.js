var http = require('http');
var ip = require('ip');
var io = require('socket.io');
var session = require('express-session');
var mysql = require('mysql');

const port = 52273;
const host ='127.0.0.1';

const dstkey = 'a52ER2###@DFDDQQ$FBPF!#)';
const svrkey = 'a52ER2###@DFDDQQ$FBPF!#)';

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
  socket.on('stat_info_wm', function (message) {
    console.log('####################'); console.log('Receive packet from web'); console.log(message);

    console.log('####################');
    if ( message.head.dstkey === svrkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(svrkey).emit('stat_info_ma', message);

      console.log('Send packet to agent');
    } else {//NO SERVER
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in('web_socketid').emit('stat_info_mw', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    };
    console.log(message);
  });
  //DIRECT QUERY AGENT TO MASTER: SYSTEM INFORMATION
  socket.on('stat_info_am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === dstkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in('web_socketid').emit('stat_info_mw', message);

      console.log('Send packet to web'); console.log(message);
    } else {//INCORRECT SVRKEY
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';

      console.log('Send packet to agent: ERR- SEND BACK');
    }
    io.sockets.in('web_socketid').emit('stat_info_mw', message);
  });
  //DIRECT QUERY WEB TO MASTER: NETWORK - NETSTAT
  socket.on('stat_net_wm', function (message) {
    console.log('####################'); console.log('Receive packet from web'); console.log(message);

    console.log('####################');
    if ( message.head.dstkey === svrkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(svrkey).emit('stat_net_ma', message);

      console.log('Send packet to agent');
    } else {//NO SERVER
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in('web_socketid').emit('stat_net_mw', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    };
    console.log(message);
  });
  //DIRECT QUERY AGENT TO MASTER: NETWORK - NETSTAT
  socket.on('stat_net_am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === dstkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in('web_socketid').emit('stat_net_mw', message);

      console.log('Send packet to web'); console.log(message);
    } else {//INCORRECT SVRKEY
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';

      console.log('Send packet to agent: ERR- SEND BACK');
    }
    io.sockets.in('web_socketid').emit('stat_disk_mw', message);
  });
  //DIRECT QUERY WEB TO MASTER: IPCS - QUEUE
  socket.on('stat_ipcq_wm', function (message) {
    console.log('####################'); console.log('Receive packet from web'); console.log(message);

    console.log('####################');
    if ( message.head.dstkey === svrkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(svrkey).emit('stat_ipcq_ma', message);

      console.log('Send packet to agent');
    } else {//NO SERVER
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in('web_socketid').emit('stat_ipcq_mw', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    };
    console.log(message);
  });
  //DIRECT QUERY AGENT TO MASTER: IPCS - QUEUE
  socket.on('stat_ipcq_am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === dstkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in('web_socketid').emit('stat_ipcq_mw', message);

      console.log('Send packet to web'); console.log(message);
    } else {//INCORRECT SVRKEY
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';

      console.log('Send packet to agent: ERR- SEND BACK');
    }
    io.sockets.in('web_socketid').emit('stat_ipcq_mw', message);
  });
  //DIRECT QUERY WEB TO MASTER: IPCS - SHM
  socket.on('stat_ipcm_wm', function (message) {
    console.log('####################'); console.log('Receive packet from web'); console.log(message);

    console.log('####################');
    if ( message.head.dstkey === svrkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(svrkey).emit('stat_ipcm_ma', message);

      console.log('Send packet to agent');
    } else {//NO SERVER
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in('web_socketid').emit('stat_ipcm_mw', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    };
    console.log(message);
  });
  //DIRECT QUERY AGENT TO MASTER: IPCS - SHM
  socket.on('stat_ipcm_am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === dstkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in('web_socketid').emit('stat_ipcm_mw', message);

      console.log('Send packet to web'); console.log(message);
    } else {//INCORRECT SVRKEY
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';

      console.log('Send packet to agent: ERR- SEND BACK');
    }
    io.sockets.in('web_socketid').emit('stat_ipcm_mw', message);
  });
  //DIRECT QUERY WEB TO MASTER: DISK - FILE SYSTEM
  socket.on('stat_disk_wm', function (message) {
    console.log('####################'); console.log('Receive packet from web'); console.log(message);

    console.log('####################');
    if ( message.head.dstkey === svrkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in(svrkey).emit('stat_disk_ma', message);

      console.log('Send packet to agent');
    } else {//NO SERVER
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in('web_socketid').emit('stat_disk_mw', message);

      console.log('Send packet to web: ERR- INCORRECT DSTKEY');
    };
    console.log(message);
  });
  //DIRECT QUERY AGENT TO MASTER: DISK - FILE SYSTEM
  socket.on('stat_disk_am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === dstkey ) {//MORE SVRKEY WILL BE SUPPLY
      io.sockets.in('web_socketid').emit('stat_disk_mw', message);

      console.log('Send packet to web'); console.log(message);
    } else {//INCORRECT SVRKEY
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';

      console.log('Send packet to agent: ERR- SEND BACK');
    }
    io.sockets.in('web_socketid').emit('stat_disk_mw', message);
  });

// DB_QUERY

  socket.on('db_query', function (message) {

    console.log('####################'); console.log('Receive packet from agent'); console.log(message);
    if ( message.head.svrkey === svrkey) {
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
