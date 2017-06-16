var http = require('http');
var ip = require('ip');
var io = require('socket.io');
var session = require('express-session');

const port = 52273;
const host ='127.0.0.1';

const dstkey = 'a52ER2###@DFDDQQ$FBPF!#)(*<NSam%T%GdDF)';
const svrkey = 'a52ER2###@DFDDQQ$FBPF!#)(*<NSam%T%GdDF)';

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
    if ( message.head.dstkey === dstkey ) {//@@@@@@@@@@ UPDATE SOON MULTI AGENT
      io.sockets.in(dstkey).emit('stat_info_ma', message);

      console.log('Send packet to agent');
    } else {
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in('web_socketid').emit('stat_info_mw', message);

      console.log('Send packet to web: ERR- SEND BACK');
    };
    console.log(message);
  });
  //DIRECT QUERY AGENT TO MASTER:
  socket.on('stat_info_am', function (message) {
    console.log('####################'); console.log('Receive packet from agent');
    console.log(message);

    if ( message.head.svrkey === svrkey ) {
      io.sockets.in('web_socketid').emit('stat_info_mw', message);

      console.log('Send packet to web');
    } else {
      message.error.code = 0; message.error.mesg = 'Incorrect packet data';
      io.sockets.in(svrkey).emit('stat_info_ma', message);

      console.log('Send packet to agent: ERR- SEND BACK');
    }
  });

  //DISCONNECT
  socket.on('disconnect', function() {
    console.log('Client disconnected');
  });

});
