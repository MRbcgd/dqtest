var io = require('socket.io-client');
var session = require('express-session');

const port = 52273;
const host ='127.0.0.1';

var socket = io.connect('http://' + host + ':' + port, { reconnect: true } );//RECONNECT

var func_socket = require('./func_socket');//ABOUT SOCKET
var func_query = require('./func_query');//DB QUERY, DIRECT QUERY

// func_socket.conn_socket(socket);
// func_socket.ip_check(socket);
setInterval(function (){
  process.nextTick((function(test){
    return function () {
      test.emit('test',{ data:'1'})
    }
  })(socket))
},1000)
console.log('test');
setTimeout(function(){console.log('hi');}
  ,5000)
  
socket.emit('test',{data:'1'});
socket.on('test1',function(message){
  console.log(message);
  console.log('success');
})
socket.on('stat_info_ma', function (message) {
  var packet = {
    head: {},
    input: {},
    output: {},
    error: {}
  };
  console.log('####################');
  console.log('Receive packet from master');//DIRECT QUERY
  console.log(message);

  packet.head.login_token = message.head.login_token;
  packet.head.svccd = message.head.svccd;
  packet.head.query_type = message.head.query_type;
  packet.head.svrkey = session.svrkey;

  if (message.head.dstkey !== session.svrkey) {
    packet.error.code = 101; packet.error.mesg = 'Incorrect packet data';
  } else {
    packet.error.code = 0; packet.error.mesg = 'Correct packet data';
    packet.output = func_query.stat_info(func_query.cpu_info(), func_query.mem_info());
  }

  socket.emit('stat_info_am', packet);
  console.log('####################'); console.log('Send packet to master'); console.log(packet);
});
socket.on('stat_disk_ma', function (message) {
  var packet = {
    head: {},
    input: {},
    output: {},
    error: {}
  };
  console.log('####################');
  console.log('Receive packet from master');//DIRECT QUERY
  console.log(message);

  packet.head.login_token = message.head.login_token;
  packet.head.svccd = message.head.svccd;
  packet.head.query_type = message.head.query_type;
  packet.head.svrkey = session.svrkey;

  if (message.head.dstkey !== session.svrkey) {
    packet.error.code = 101; packet.error.mesg = 'Incorrect packet data';
    socket.emit('stat_disk_am', packet);
  } else {
    func_query.stat_disk( function (result) {
      // packet.error.code = 0; packet.error.mesg = 'Correct packet data';
      packet.output = result;
      socket.emit('stat_disk_am', packet);
    });
  }
  console.log('####################'); console.log('Send packet to master'); console.log(packet);
});

//DATACAPTURE
