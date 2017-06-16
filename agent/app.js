var io = require('socket.io-client');

const port = 52273;
const host ='127.0.0.1';

var socket = io.connect('http://' + host + ':' + port, { reconnect: true } );//RECONNECT

var func_socket = require('./func_socket');

func_socket.conn_socket(socket);
func_socket.ip_check(socket);
socket.on('stat_info_ma', function (message) {
  console.log(message);
});
//DATACAPTURE
