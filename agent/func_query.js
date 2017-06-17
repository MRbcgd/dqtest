var ip = require('ip');
var os = require('os');
var fs = require('fs');
// var conn = require('./db.js');

var session = require('express-session');


const local_ip = ip.address();//for test

module.exports.cpu_info = function () {//get cpu resource
  var cpuinfo = require('proc-cpuinfo')();
  var result = {};

  result.model_name = cpuinfo.model_name.join(' ');
  result.cpu_MHz = cpuinfo.cpu_MHz[0];
  result.cache_size = cpuinfo.cache_size.join(' ');
  result.stepping = cpuinfo.stepping[0];
  result.vendor_id = cpuinfo.vendor_id[0];
  result.bogomips = cpuinfo.bogomips[0];

  return result;
};
module.exports.mem_info = function () {//get memory resource
  var info = {};
  var result = {};
  var data = fs.readFileSync('/proc/meminfo').toString();

  data.split(/\n/g).forEach(function(line){
      line = line.split(':');

      // Ignore invalid lines, if any
      if (line.length < 2) {
          return;
      }

      // Remove parseInt call to make all values strings
      info[line[0]] = parseInt(line[1].trim(), 10);
  });

  result.MemTotal = info.MemTotal;
  result.MemFree = info.MemFree;
  result.MemSwap = info.SwapTotal - info.SwapFree;

  return result;
};
module.exports.stat_info = function (data1,data2) {//system information ##direct-query

  var result = {};

  for(var key in data1) result[key] = data1[key];
  for(var key in data2) result[key] = data2[key];

  result.platform = os.platform();
  result.kernel = 'i dnt knw.';
  result.hostname = os.hostname();
  result.ip = ip.address();

  return result;
};
module.exports.usage_status = function () {

};
module.exports.cpu_usage = function () {

};
module.exports.stat_prcs = function () {
var getMetrics = require('metrics-process');
function onMetrics( error, metrics ) {
    if ( error ) {
        throw new Error( error );
    }
    console.log( JSON.stringify( metrics ) );
};

getMetrics( onMetrics );
//   const psList = require('ps-list');
//   var usage = require('usage');
//   var options = { keepHistory: true }
//   usage.lookup(7893,options, function(err, result) {
//     console.log(result);
//   });
//   usage.lookup(7905, function(err, result) {
//     console.log(result);
//   });
//   usage.clearHistory(7905); //clear history for the given pid
//   usage.clearHistory();
// psList().then(data => {
//
//     for (var i = 0; i < data.length; i++) {
//       var options = { keepHistory: true }
//       usage.lookup(data[i].pid,options, function(err, result) {
//         console.log(result);
//       });
//       usage.clearHistory(data[i].pid); //clear history for the given pid
//       usage.clearHistory();
//     }
//
// });
};
module.exports.usage_tcp = function () {
  var promise = require('ifconfig-linux')(); // this return a promise
  promise.then(console.dir);
};
module.exports.usage_disk = function () {//get disk usage ##db-query
  var df = require('df');

  df(function (err, table) {
    if (err) {
      console.error(err.stack);
      return;
    }

    var mount, total, us = 0;

    for (var i = 0; i < table.length; i++) {//top usage
      if ( us < table[i].percent ) {
        mount = table[i].mountpoint;
        total = table[i].available;
        us = table[i].percent;
      };
    };

    //command df -> this attribute 'used' is use(%).
    // var sql = 'INSERT INTO AgentInfo(idAgentDisk, AgentInfo_svrkey, idate, mount, total, used) VALUES (?,?,?,?,?,?);';
    //
    // conn query(sql, function (err, results))
    //
    // return us;
  });
};
module.exports.stat_net = function () {
  var netstat = require('node-netstat');

  netstat({
      filter: {
          pid: 4905,
          protocol: 'tcp'
      },
      limit: 5
  }, function (data) {
    console.log(data);
      // a single line of data read from netstat
  });
}
module.exports.stat_disk = function ( callback ) {//disk status ##direct-query
  var df = require('df');

  df(function (err, table) {
    if (err) {
      console.error(err.stack);
      return;
    };

    return callback(table);

  });
};
function aa (socket) {
socket.emit('test',{data:'1'});
}
module.exports.hi = function(socket) {
  setInterval(function(socket){
    socket.emit('test',{data:'1'});
  }
  ,1000)
socket.emit('test',{data:'1'});

}
