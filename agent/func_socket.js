var ip = require('ip');
var session = require('express-session');

module.exports.conn_socket = function (socket) {
  //CONNECT
  socket.on('connect', function() {
    socket.emit('ip_check', { data: '127.0.0.1' });
    console.log('The socket network is connected');
  });
  //DISCONNECT
  socket.on('disconnect', function() {
    console.log('Master disconnected');
  });
};
module.exports.ip_check = function (socket) {
  socket.emit('ip_check', { data: '127.0.0.1' });//IP CHECK
  socket.on('ip_result', function (message) {//IP RESULT

    if (message.data === 'fail') {
      socket.emit('ip_check', { data: '127.0.0.1' });

      console.log('Inaccessible IP: Reconnect');
    } else {
      session.svrkey = message.data;
      socket.emit('join', session.svrkey);//PRIVATE COMMUNICATION

      console.log('Allow access');
    };
  });
};
