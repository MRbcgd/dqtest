var io = require('socket.io-client');
var session = require('express-session');

const port = 52273;
const host ='127.0.0.1';

var socket = io.connect('http://' + host + ':' + port, { reconnect: true } );//RECONNECT

var func_socket = require('./func_socket');//ABOUT SOCKET
var func_query = require('./func_query');//DB QUERY, DIRECT QUERY

func_socket.conn_socket(socket);
func_socket.ip_check(socket);

var packet = {
  head: {},
  output: {},
  error: {}
};

socket.on('stat_info_ma', function (message) {
  console.log('####################');
  console.log('Receive packet from master: DQ- stat_info event');//DIRECT QUERY
  console.log(message);
  packet.head.svrkey = session.svrkey; //DSTKEY -> SVRKEY NAME CHANGE
  packet.head.login_token = message.head.login_token;
  packet.head.query_type = message.head.query_type;
  packet.head.svccd = message.head.svccd;

  if (message.head.dstkey !== session.svrkey) {


    packet.error.code = 101; packet.error.mesg = 'Incorrect packet data';
  } else {
    packet.error.code = 0; packet.error.mesg = 'Correct packet data';
    packet.output = func_query.stat_info(func_query.cpu_info(), func_query.mem_info());//SYSTEM INFORMATION
  }

  socket.emit('stat_info_am', packet);
  console.log('####################'); console.log('Send packet to master'); console.log(packet);
});
//DATACAPTURE
