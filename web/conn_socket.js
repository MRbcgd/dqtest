var io = require('socket.io-client');

const port = 52273;
const host ='127.0.0.1';

var socket = io.connect('http://' + host + ':' + port, { reconnect: true });//RECONNECT

socket.on('connect', function(socket) {
  console.log('The socket network is connected');
});
socket.on('disconnect', function(socket) {
  console.log('Master disconnected');
});

module.exports = socket;
