var ip = require('ip');
var os = require('os');
var fs = require('fs');
var async = require('async');
// var conn = require('./db.js');

var session = require('express-session');


const local_ip = ip.address();//for test


//usage_status
//usage_cpu
//stat_prcs
//
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
module.exports.usage_status = function (callback) {
  // var cpu_usage = os.loadavg();
  //
  // var free = require('freem');
  // var df = require('df');
  //
  // free(function (err, list) {
  //
  //   df(function (err, table) {
  //     if (err) {
  //       console.error(err.stack);
  //       return;
  //     }
  //
  //     var disk_usage = 0;
  //
  //     for (var i = 0; i < table.length; i++) {//top usage
  //       if ( disk_usage < table[i].percent ) {
  //         disk_usage = table[i].percent;
  //       };
  //     };
  //     var mem_usage = list[0].used - list[0].buffers - list[0].cached;
  //
  //     mem_usage /= list[0].total;
  //     return callback(cpu_usage[0], mem_usage * 100, disk_usage);
  //   });
  //
  // });
  // // usage_mem(function)


};
module.exports.usage_cpu = function () {
  //
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
module.exports.usage_mem = function (callback) {
  var free = require('freem');
  free(function (err, list) {
    callback(list)
  });
};
module.exports.usage_tcp = function (callback) {
  var netStat = require('net-stat')
  var allStats = netStat.raw();

  return callback(allStats);
};
function hexToIP(val) {
        var ip1 = parseInt("0x" + val.substr(0, 2));
        var ip2 = parseInt("0x" + val.substr(2, 2));
        var ip3 = parseInt("0x" + val.substr(4, 2));
        var ip4 = parseInt("0x" + val.substr(6, 2));

        return ip4 + "." + ip3 + "." + ip2 + "." + ip1;
};
function parse_tcp (data, flag, obj_arr) {

        var loopcnt = 0;

        data.toString().split("\n").forEach( function(line) {
                if( loopcnt <= 0 ) {
                        loopcnt++;
                        return;
                }
                loopcnt++;

                line = line.trim();
                if( line == null || line.length <= 0 ) {
                        // console.log("line length error... [" + line.length + "]");
                        return;
                }

                var obj_tcp  = {};

                var record = line.replace(/\s+/g,' ');
                if( record == null ) {
                        console.log("record is null");
                        return;
                }

                var items = record.split(' ').map(function(item) {
                        return item.trim();
                });
                if( items == null || items.length < 7 ) {
                        console.log("items.length < 7");
                        return;
                }

                var cols;

                obj_tcp.ntype = flag;

                // local_address
                cols = items[1].split(':');
                if( cols != null ) {
                        obj_tcp.lip   = hexToIP(cols[0]);
                        obj_tcp.lport = parseInt("0x" + cols[1]);
                }

                // remote_address
                cols = items[2].split(':');
                if( cols != null ) {
                        obj_tcp.rip   = hexToIP(cols[0]);
                        obj_tcp.rport = parseInt("0x" + cols[1]);
                }

                // status
                var net_state = {
                        0  : "NONE" ,
                        1  : "ESTABLISHED" ,
                        2  : "SYN_SENT" ,
                        3  : "SYN_RECV" ,
                        4  : "FIN_WAIT1" ,
                        5  : "FIN_WAIT2" ,
                        6  : "TIME_WAIT" ,
                        7  : "CLOSE" ,
                        8  : "CLOSE_WAIT" ,
                        9  : "LAST_ACK" ,
                        10 : "LISTEN" ,
                        11 : "CLOSING" ,
                };
                obj_tcp.st = net_state[ parseInt("0x" + items[3]) ];

                // tx,rx
                cols = items[4].split(':');
                if( cols != null ) {
                        obj_tcp.tx_queue = parseInt("0x" + cols[0]);
                        obj_tcp.rx_queue = parseInt("0x" + cols[1]);
                }

                obj_arr.push(obj_tcp);
        });
}
module.exports.tcp = function(callback) {
        fs.readFile('/proc/net/tcp', function(err,data) {
                console.log("proc_tcp ------------------------------>");
                if( err != null ) {
                        console.log("net_tcp... err");
                        return callback(null, null);

                }

                var obj_arr = [];
                parse_tcp(data, "tcp", obj_arr);

                fs.readFile('/proc/net/tcp6', function(err,data) {
                        // console.log("proc_net.net_tcp6 ------------------------------>");
                        if( err != null ) {
                                console.log("net_tcp6... err");
                                return callback(null, obj_arr);

                        }
                        parse_tcp(data, "tcp6", obj_arr);

                        /*
                        obj_arr.sort(function(a,b) {
                        });
                        */

                        console.log("<------------------------------ proc_tcp");
                        // console.log("net_tcp:" + JSON.stringify(obj_arr));
                        return callback(null, obj_arr);
                });
        });
}
module.exports.udp = function(callback) {
        fs.readFile('/proc/net/udp', function(err,data) {
                console.log("proc_udp ------------------------------>");
                if( err != null ) {
                        console.log("net_udp... err");
                        return callback(null, null);

                }

                var obj_arr = [];
                parse_tcp(data, "udp", obj_arr);

                fs.readFile('/proc/net/udp6', function(err,data) {
                        // console.log("proc_net.net_tcp6 ------------------------------>");
                        if( err != null ) {
                                console.log("net_udp6... err");
                                return callback(null, obj_arr);

                        }
                        parse_tcp(data, "udp6", obj_arr);

                        /*
                        obj_arr.sort(function(a,b) {
                        });
                        */

                        console.log("<------------------------------ proc_udp");
                        // console.log("net_tcp:" + JSON.stringify(obj_arr));
                        return callback(null, obj_arr);
                });
        });
}
module.exports.stat_net = function(callback) {
        console.log("proc_net ------------------------------>");

        async.parallel([module.exports.tcp, module.exports.udp], function(err, results) {
                var obj_net = {
                        tcp : [],
                        udp : [],
                };
                obj_net.tcp = results[0];
                obj_net.udp = results[1];

                console.log("<------------------------------ proc_net");
                return callback(null, obj_net);
        });
}
module.exports.stat_ipcq = function(callback){
        fs.readFile('/proc/sysvipc/msg', function(err,data) {
                console.log("ipc-msg ------------------------------>\n");

                var obj_arr = [];
                var arrcnt = 0;
                var loopcnt = 0;

                if( err != null ) {
                        console.log("ipc-msg... err");
                        return callback(null, null);

                }

                data.toString().split("\n").forEach( function(line) {
                        if( loopcnt <= 0 ) {
                                loopcnt++;
                                return;
                        }
                        loopcnt++;

                        line = line.trim();
                        if( line == null || line.length <= 0 ) {
                                // console.log("line length error... [" + line.length + "]");
                                return;
                        }

                        var obj_ipcq = {};

                        var record = line.replace(/\s+/g,' ');
                        if( record == null ) {
                                console.log("record is null");
                                return;
                        }

                        var items = record.split(' ').map(function(item) {
                                return item.trim();
                        });
                        if( items == null || items.length < 7 ) {
                                console.log("items.length < 7");
                                return;
                        }

                        obj_ipcq.key     = ustd.decToHex(items[0], 8); // "0x" + Number(items[0]).toString(16);
                        obj_ipcq.msqid   = items[1];
                        obj_ipcq.perms   = items[2];
                        obj_ipcq.cbytes  = items[3];
                        obj_ipcq.qnum    = items[4];

                        obj_ipcq.lspid   = items[5];
                        obj_ipcq.lrpid   = items[6];
                        obj_ipcq.owner   = ustd.getSysUser(items[7]);

                        obj_ipcq.stime   = ustd.dateFormat(new Date(items[11]*1000), "%Y%m%d%H%M%S", false);
                        obj_ipcq.rtime   = ustd.dateFormat(new Date(items[12]*1000), "%Y%m%d%H%M%S", false);
                        obj_ipcq.ctime   = ustd.dateFormat(new Date(items[13]*1000), "%Y%m%d%H%M%S", false);

                        obj_arr[arrcnt] = obj_ipcq;
                        arrcnt++;
                });

                // console.log("ipc-msg=" + JSON.stringify(obj_arr) + "\n");
                console.log("<------------------------------ ipc-msg\n");
                return callback(null, obj_arr);
        });
}
module.exports.stat_ipcm = function(callback){
        fs.readFile('/proc/sysvipc/shm', function(err,data) {
                console.log("ipc-shm ------------------------------>\n");

                var obj_arr = [];
                var arrcnt = 0;
                var loopcnt = 0;

                if( err != null ) {
                        console.log("ipc-shm... err");
                        return callback(null, null);

                }

                data.toString().split("\n").forEach( function(line) {
                        if( loopcnt <= 0 ) {
                                loopcnt++;
                                return;
                        }
                        loopcnt++;

                        line = line.trim();
                        if( line == null || line.length <= 0 ) {
                                // console.log("line length error... [" + line.length + "]");
                                return;
                        }

                        var obj_ipcm = {};

                        var record = line.replace(/\s+/g,' ');
                        if( record == null ) {
                                console.log("record is null");
                                return;
                        }

                        var items = record.split(' ').map(function(item) {
                                return item.trim();
                        });
                        if( items == null || items.length < 7 ) {
                                console.log("items.length < 7");
                                return;
                        }
                        // key
                        obj_ipcm.key     = items[0];
                        obj_ipcm.shmid   = items[1];
                        obj_ipcm.perms   = items[2];
                        obj_ipcm.size    = items[3];
                        //                   items[4]; // cpid
                        //                   items[5]; // lpid
                        obj_ipcm.nattach = items[6];
                        obj_ipcm.muid    = items[7];
                        obj_ipcm.mgid    = items[8];
                        //                   items[9]; // cuid
                        //                   items[10]; // cgid
                        obj_ipcm.atime   = items[11];
                        obj_ipcm.dtime   = items[12];
                        obj_ipcm.ctime   = items[13];
                        obj_ipcm.res     = items[14];
                        obj_ipcm.swap    = items[15];

                        obj_arr[arrcnt] = obj_ipcm;
                        arrcnt++;
                });

                // console.log("ipc-shm=" + JSON.stringify(obj_arr) + "\n");
                console.log("<------------------------------ ipc-shm\n");
                return callback(null, obj_arr);
        });
}
module.exports.usage_disk = function (callback) {//get disk usage ##db-query
  var df = require('df');

  df(function (err, table) {
    if (err) {
      console.error(err.stack);
      return;
    }

    var mount, total, us = 0;

    for (var i = 0; i < table.length; i++) {//top usage
      if ( us < table[i].percent ) {
        us = table[i].percent;
      };
    };
    return callback(us);
  });
};
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
