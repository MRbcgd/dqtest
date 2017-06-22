process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

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

//DIRECT QUERY
//#########################################################################################################
//#########################################################################################################
//#########################################################################################################
socket.on('ma', function (message) {
  var packet = {head: {},input: {},output: {}, error: {}
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
    var svccd = packet.head.svccd;
    packet.error.code = 0; packet.error.mesg = 'Correct packet data';

    if (svccd === 'stat_info') {
      packet.output = func_query.stat_info(func_query.cpu_info(), func_query.mem_info());
      socket.emit('am', packet);
      console.log('####################'); console.log('Send packet to master'); console.log(packet);
    };
    if (svccd === 'stat_prcs') {
      func_query.stat_prcs(function(result){
        packet.output = result;
        socket.emit('am', packet);
        console.log('####################'); console.log('Send packet to master'); console.log(packet);
      });
    };
    if (svccd === 'stat_net') {
      func_query.stat_net( function (err, result) {
        packet.output = result;
        socket.emit('am', packet);
        console.log('####################'); console.log('Send packet to master'); console.log(packet);
      });
    };
    if (svccd === 'stat_ipcq') {
      func_query.stat_ipcq( function (err, result) {

        packet.output = result;
        socket.emit('am', packet);
        console.log('####################'); console.log('Send packet to master'); console.log(packet);
      });
    };
    if (svccd === 'stat_ipcm') {
      func_query.stat_ipcm( function (err, result) {
        packet.output = result;
        socket.emit('am', packet);
        console.log('####################'); console.log('Send packet to master'); console.log(packet);
      });
    };
    if (svccd === 'stat_disk') {
      func_query.stat_disk( function (result) {
        packet.output = result;
        socket.emit('am', packet);
        console.log('####################'); console.log('Send packet to master'); console.log(packet);
      });
    }
  }
});

//DB QUERY
//#########################################################################################################
//#########################################################################################################
//#########################################################################################################

function cpuAverage() {

  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();

  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) {

    //Select CPU core
    var cpu = cpus[i];

    //Total up the time in the cores tick
    for(type in cpu.times) {
      totalTick += cpu.times[type];
   }

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

var startMeasure = cpuAverage();

function get_cpuusage () {
  var endMeasure = cpuAverage();

  //Calculate the difference in idle and total time between the measures
  var idleDifference = endMeasure.idle - startMeasure.idle;
  var totalDifference = endMeasure.total - startMeasure.total;

  //Calculate the average percentage CPU usage
  var percentageCPU = 100 - (100 * idleDifference / totalDifference);

  return percentageCPU;
};

setInterval(function (){
  process.nextTick((function(db_socket){
    return function () {
      if (session.svrkey) {
        //CPU - CPU
        func_query.stat_prcs(function(result){
          if(!result) {
            return;
          }

          var packet = {head: {}, input: {}, output: {}, error: {}};

          var us = get_cpuusage();
          // var us = os.loadavg();

          packet.head.svccd = 'stat_prcs'; packet.head.query_type = 'db'; packet.head.svrkey = session.svrkey;
          packet.output.cpu = {
            date : func_query.getWorldTime(+9),//KST
            us: us,
            prcs1_nm: result[0].cmmd, prcs1_us: Number(result[0].pcpu),
            prcs2_nm: result[1].cmmd, prcs2_us: Number(result[1].pcpu),
            prcs3_nm: result[2].cmmd, prcs3_us: Number(result[2].pcpu)
          };

          console.log('####################'); console.log('Send packet to master'); console.log(packet);
          db_socket.emit('db_query', packet);
        });

        //USAGE -MEMORY
        func_query.usage_mem(function(result){
          if(!result) {
            return;
          }
          var packet = {head: {}, input: {}, output: {}, error: {}};
          var mem_usage = result[0].used - result[0].buffers - result[0].cached;
          var swap_used = result[1].used / result[1].total;
          mem_usage /= result[0].total;

          packet.head.svccd = 'usage_mem'; packet.head.query_type = 'db';packet.head.svrkey = session.svrkey;
          packet.output.memory = {
            date : func_query.getWorldTime(+9),//KST
             us: mem_usage * 100,
            swap: swap_used * 100
          };

          console.log('####################'); console.log('Send packet to master'); console.log(packet);
          db_socket.emit('db_query', packet);
        });

        //NETWROK - TCP
        func_query.usage_tcp(function(result){
          if(!result) {
            return;
          }
          var packet = {head: {}, input: {}, output: {}, error: {}};
          // var arr = Object.keys(result);

          packet.head.svccd = 'usage_tcp'; packet.head.query_type = 'db';packet.head.svrkey = session.svrkey;


            if ( result['ens33'] ) {//TEST
              packet.output.tcp = {
                date : func_query.getWorldTime(+9),//KST
                eth: 'ens33',
                rcv: Number(result['ens33'].bytes.receive),
                snd: Number(result['ens33'].bytes.transmit)
              };
              console.log('####################'); console.log('Send packet to master'); console.log(packet);
              db_socket.emit('db_query', packet);
            };
            if (result['enp2s0']) {
              packet.output.tcp = {
                date : func_query.getWorldTime(+9),//KST
                eth: 'enp2s0',
                rcv: Number(result['enp2s0'].bytes.receive),
                snd: Number(result['enp2s0'].bytes.transmit)
              };
              console.log('####################'); console.log('Send packet to master'); console.log(packet);
              db_socket.emit('db_query', packet);
            };
            if (result['virbr0-nic']) {
              packet.output.tcp = {
                date : func_query.getWorldTime(+9),//KST
                eth: 'virbr0-nic',
                rcv: Number(result['virbr0-nic'].bytes.receive),
                snd: Number(result['virbr0-nic'].bytes.transmit)
              };

              console.log('####################'); console.log('Send packet to master'); console.log(packet);
              db_socket.emit('db_query', packet);
            }

        });

        //IPCQ
        func_query.stat_ipcq(function(err,result){
          var packet = {head: {}, input: {}, output: {}, error: {}};
          var max = result[0];

          if(!result){
            return;
          }
          if(max.key === undefined) {
            return;
          }
            for (var i = 0; i < result.length; i++) {
              if (max.qnum < result[i].qnum) {
                max = result[i];
              }
            };


            packet.head.svccd = 'stat_ipcq'; packet.head.query_type = 'db'; packet.head.svrkey = session.svrkey;
            packet.output.queue = {
              date : func_query.getWorldTime(+9),//KST
              key: max.key,
              msqid: max.msqid,
              cbytes: max.cbytes,
              qnum: max.qnum
            }
            console.log('####################'); console.log('Send packet to master'); console.log(packet);
            db_socket.emit('db_query', packet);

        });

        //DISK
        func_query.usage_disk(function(result){
          if(!result) {
            return;
          };

          var packet = {head: {}, input: {}, output: {}, error: {}};
          var usage = result;

          packet.head.svccd = 'usage_disk'; packet.head.query_type = 'db'; packet.head.svrkey = session.svrkey;
          packet.output.disk = {
            date : func_query.getWorldTime(+9),//KST
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
