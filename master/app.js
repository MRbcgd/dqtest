var http = require('http');
var ip = require('ip');
var io = require('socket.io');
var session = require('express-session');

const port = 52273;
const host ='127.0.0.1';
const dstkey = '9525!@#!$#^&*&^%$DFGHJ#@!#$NN651%@';
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

  //PRIVATE COMMUNICATION
  socket.on('stat_info_wm', function (message) {
    console.log('Receive packet');

    if ( message.input.dstkey === dstkey ) {
      io.sockets.in(svrkey).emit('stat_info_ma', message);
      console.log('Send packet to agent');
    };

  });

  //DISCONNECT
  socket.on('disconnect', function() {
    console.log('Client disconnected');
  });

});
