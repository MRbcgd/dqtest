
  console.log('1');
  // Connect to server
  var io = require('socket.io-client');
  var socket = io.connect('http://localhost:52273', {reconnect: true});

  console.log('2');
  socket.on('connect', function(socket) {
    console.log('Connected!');
  });
  socket.emit('wm',{data:'wm'});
  socket.on('mw',function(data){
    console.log(data);
  });
  // Add a connect listener

  console.log('3');
