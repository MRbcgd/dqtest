var io = require('socket.io-client');
var session = require('express-session');
var os = require('os');
const port = 52273;
const host ='127.0.0.1';

var socket = io.connect('http://' + host + ':' + port, { reconnect: true } );//RECONNECT

var func_socket = require('./func_socket');//ABOUT SOCKET
var func_query = require('./func_query');//DB QUERY, DIRECT QUERY


// func_query.stat_prcs();

// func_query.usage_tcp(function (result) {
//   console.log(result.ens33.bytes);
// });

// func_query.usage_mem(function(result){
//   var mem_usage = result[0].used - result[0].buffers - result[0].cached;
//   var swap_used = result[1].used / result[1].total;
//   mem_usage /= result[0].total;
//   console.log(mem_usage * 100);
//   console.log(swap_used * 100);
// })

// func_query.stat_net(function(err,results){
//   if (err) {
//     throw err;
//   }
//   console.log(results);
// });

// func_query.stat_ipcq(function(err, result){
//   console.log(result[0]);
// })
// func_query.stat_ipcm(function(err, result){
//   console.log(data);
// })

func_socket.conn_socket(socket);
func_socket.ip_check(socket);

// setInterval(function (){
//   process.nextTick((function(test){
//     return function () {
//       test.emit('test',{ data:'1'})
//     }
//   })(socket))
// },1000)

setInterval(function (){
  var packet = {
    head: {},
    input: {},
    output: {},
    error: {}
  };
  process.nextTick((function(db_socket){
    return function () {

      func_query.usage_mem(function(result){

        var mem_usage = result[0].used - result[0].buffers - result[0].cached;
        var swap_used = result[1].used / result[1].total;
        mem_usage /= result[0].total;

        packet.head.svccd = 'usage_mem'; packet.head.query_type = 'db';
        packet.head.svrkey = session.svrkey; packet.output.memory = {
          date: new Date().toISOString().slice(0, 19).replace('T', ' '), us: mem_usage * 100, swap: swap_used * 100
        };
        // console.log(mem_usage * 100);
        // console.log(swap_used * 100);
        console.log('####################'); console.log('Send packet to master'); console.log(packet);
        db_socket.emit('test', packet);
      });

    }
  })(socket))
},1000);

socket.on('test1', function (message) {
  console.log('####################'); console.log('Receive packet from master'); console.log(message);
  if ( message.head.svrkey == session.svrkey ) {
    console.log(message);
  }
});



// socket.emit('test',{data:'1'});
// socket.on('test1',function(message){
//   console.log(message);
//   console.log('success');
// })
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
socket.on('stat_net_ma', function (message) {
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
    socket.emit('stat_net_am', packet);
    console.log('####################'); console.log('Send packet to master'); console.log(packet);
  } else {
    func_query.stat_net( function (err, result) {
      packet.error.code = 0; packet.error.mesg = 'Correct packet data';
      packet.output = result;
      socket.emit('stat_net_am', packet);
      console.log('####################'); console.log('Send packet to master'); console.log(packet);
    });
  }

});
socket.on('stat_ipcq_ma', function (message) {
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
    socket.emit('stat_ipcq_am', packet);
    console.log('####################'); console.log('Send packet to master'); console.log(packet);
  } else {
    func_query.stat_ipcq( function (err, result) {
      packet.error.code = 0; packet.error.mesg = 'Correct packet data';
      packet.output = result;
      socket.emit('stat_ipcq_am', packet);
      console.log('####################'); console.log('Send packet to master'); console.log(packet);
    });
  }
});
socket.on('stat_ipcm_ma', function (message) {
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
    socket.emit('stat_ipcm_am', packet);
    console.log('####################'); console.log('Send packet to master'); console.log(packet);
  } else {
    func_query.stat_ipcm( function (err, result) {
      packet.error.code = 0; packet.error.mesg = 'Correct packet data';
      packet.output = result[0];
      socket.emit('stat_ipcm_am', packet);
      console.log('####################'); console.log('Send packet to master'); console.log(packet);
    });
  }
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
    console.log('####################'); console.log('Send packet to master'); console.log(packet);
  } else {
    func_query.stat_disk( function (result) {
      packet.error.code = 0; packet.error.mesg = 'Correct packet data';
      packet.output = result;
      socket.emit('stat_disk_am', packet);
      console.log('####################'); console.log('Send packet to master'); console.log(packet);
    });
  }

});

//DATACAPTURE
