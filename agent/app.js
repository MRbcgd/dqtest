var io = require('socket.io-client');
var session = require('express-session');
var os = require('os');

const port = 52273;
const host ='127.0.0.1';

var socket = io.connect('http://' + host + ':' + port, { reconnect: true } );//RECONNECT

var func_socket = require('./func_socket');//ABOUT SOCKET
var func_query = require('./func_query');//DB QUERY, DIRECT QUERY

func_socket.conn_socket(socket);
func_socket.ip_check(socket);

//DB QUERY
//#########################################################################################################
//#########################################################################################################
//#########################################################################################################
setInterval(function (){
  process.nextTick((function(db_socket){
    return function () {
      if (session.svrkey) {
        //CPU - CPU
        func_query.stat_prcs(function(result){
          var packet = {head: {}, input: {}, output: {}, error: {}};
          var us = os.loadavg();

          packet.head.svccd = 'stat_prcs'; packet.head.query_type = 'db'; packet.head.svrkey = session.svrkey;
          packet.output.cpu = {
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            us: us[0],
            prcs1_nm: result[0].cmmd, prcs1_us: Number(result[0].pcpu),
            prcs2_nm: result[1].cmmd, prcs2_us: Number(result[1].pcpu),
            prcs3_nm: result[2].cmmd, prcs3_us: Number(result[2].pcpu)
          };

          console.log('####################'); console.log('Send packet to master'); console.log(packet);
          db_socket.emit('db_query', packet);
        });

        //USAGE -MEMORY
        func_query.usage_mem(function(result){
          var packet = {head: {}, input: {}, output: {}, error: {}};
          var mem_usage = result[0].used - result[0].buffers - result[0].cached;
          var swap_used = result[1].used / result[1].total;
          mem_usage /= result[0].total;

          packet.head.svccd = 'usage_mem'; packet.head.query_type = 'db';packet.head.svrkey = session.svrkey;
          packet.output.memory = {
            date: new Date().toISOString().slice(0, 19).replace('T', ' '), us: mem_usage * 100, swap: swap_used * 100
          };

          console.log('####################'); console.log('Send packet to master'); console.log(packet);
          db_socket.emit('db_query', packet);
        });

        //NETWROK - TCP
        func_query.usage_tcp(function(result){
          var packet = {head: {}, input: {}, output: {}, error: {}};
          var arr = Object.keys(result);

          packet.head.svccd = 'usage_tcp'; packet.head.query_type = 'db';packet.head.svrkey = session.svrkey;

          for (var i = 0; i < arr.length; i++) {
            if (arr[i] === 'ens33') {//TEST
              packet.output.tcp = {
                date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                eth: 'ens33',
                rcv: Number(result.ens33.bytes.receive),
                snd: Number(result.ens33.bytes.transmit)
              };
              console.log('####################'); console.log('Send packet to master'); console.log(packet);
              db_socket.emit('db_query', packet);
            };
            if (arr[i] === 'enp2s0') {
              packet.output.tcp = {
                date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                eth: 'enp2s0',
                rcv: Number(result.enp2s0.bytes.receive),
                snd: Number(result.enp2s0.bytes.transmit)
              };
              console.log('####################'); console.log('Send packet to master'); console.log(packet);
              db_socket.emit('db_query', packet);
            };
            if (arr[i] === 'virbr0-nic') {
              packet.output.tcp = {
                date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                eth: 'virbr0-nic',
                rcv: Number(result.virbr0-nic.bytes.receive),
                snd: Number(result.virbr0-nic.bytes.transmit)
              };

              console.log('####################'); console.log('Send packet to master'); console.log(packet);
              db_socket.emit('db_query', packet);
            }
          };
        });

        //IPCQ
        func_query.stat_ipcq(function(result){

          if(!result) {
            return;
          }

          var packet = {head: {}, input: {}, output: {}, error: {}};
          var key,msqid,cbytes,qnum=0;

          for (var i = 0; i < result.length; i++) {
            if (qnum < result[i].qnum) {
              key = result[i].key;
              msqid = result[i].msqid;
              cbytes = result[i].cbytes;
              qnum = result[i].qnum;
            }
          };

          packet.head.svccd = 'stat_ipcq'; packet.head.query_type = 'db'; packet.head.svrkey = session.svrkey;
          packet.output.queue = {
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            key: key,
            msqid: msqid,
            cbytes: cbytes,
            qnum: qnum
          };
          console.log('####################'); console.log('Send packet to master'); console.log(packet);
          db_socket.emit('db_query', packet);
        });

        //DISK
        func_query.usage_disk(function(result){
          var packet = {head: {}, input: {}, output: {}, error: {}};
          var usage = result;

          packet.head.svccd = 'usage_disk'; packet.head.query_type = 'db'; packet.head.svrkey = session.svrkey;
          packet.output.disk = {
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            mount: result.mount,
            total: result.total,
            us: result.us
          };

          console.log('####################'); console.log('Send packet to master'); console.log(packet);
          db_socket.emit('db_query', packet);
        })

      }
    }
  })(socket))
},60000);

socket.on('db_query_result', function (message) {
  console.log('####################'); console.log('Receive packet from master'); console.log(message);
});

//DIRECT QUERY
//#########################################################################################################
//#########################################################################################################
//#########################################################################################################
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

socket.on('stat_prcs_ma', function (message) {
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
    func_query.stat_prcs(function(result){
      packet.error.code = 0; packet.error.mesg = 'Correct packet data';
      packet.output = result;
      socket.emit('stat_prcs_am', packet);
      console.log('####################'); console.log('Send packet to master'); console.log(packet);
    });
  }
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
