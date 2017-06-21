var ip = require('ip');
var os = require('os');
var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;
var session = require('express-session');


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

  return result;
};
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

module.exports.usage_cpu = function ( callback ) {
    exports.stat_prcs(function(result){

    });
};
module.exports.get_psef = function(callback){
    execute("ps -eo pid,user,rss,pcpu,time,comm --sort -pcpu | head -n 4", function(result){
      callback(result);
    });
};
module.exports.stat_prcs = function ( callback ) {
  exports.get_psef(function(result){
    var obj_arr = [];
    var arrcnt = 0;
    var loopcnt = 0;

    result.toString().split("\n").forEach( function(line) {
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

            var obj_cpu = {};

            var record = line.replace(/\s+/g,' ');
            if( record == null ) {
                    console.log("record is null");
                    return;
            }

            var items = record.split(' ').map(function(item) {
                    return item.trim();
            });
            if( items == null) {
              console.log('items null');
                    return;
            }

            obj_cpu.pid = items[0];
            obj_cpu.user = items[1];
            obj_cpu.res = items[2];
            obj_cpu.pcpu = items[3];
            obj_cpu.time = items[4];
            obj_cpu.cmmd = items[5];

            obj_arr[arrcnt] = obj_cpu;
            arrcnt++;
    });
    return callback(obj_arr);
  })
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
module.exports.dateFormat = function(date, fstr, utc)
{
  utc = utc ? 'getUTC' : 'get';
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
}
module.exports.decToHex = function(d, padding)
{
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

        hex = "0x" + hex;
    return hex;
}
module.exports.getSysUser = function(myUid)
{
  var _passwd;
        if( _passwd == null ) {
                var passwd = fs.readFileSync('/etc/passwd', 'utf8');
                _passwd = passwd.trim().split(/\n/);

                console.log("read passwd ...");
        }

        var passwd = _passwd;
        var items;
        for (var i = 0, l = passwd.length; i < l; i++) {
                if (passwd[i].charAt(0) === '#') continue;

                items = passwd[i].split(':');
                var otherName = items[0];
                var otherUid  = items[2];
                var otherGid  = items[3];
                if( otherUid && (otherUid == myUid) ) {
                                return otherName;
                }
        }
        return '';
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
                                // console.log('#######################');console.log('#######################');
                                // console.log("line length error... [" + line.length + "]");
                                // console.log('/proc/sysvipc/msg EMPTY!');
                                // console.log('#######################');console.log('#######################');
                                // return callback(null,null);
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
                        obj_ipcq.key    = exports.decToHex(items[0], 8); // "0x" + Number(items[0]).toString(16);
                        obj_ipcq.msqid  = items[1];
                        obj_ipcq.perms  = items[2];
                        obj_ipcq.cbytes = items[3];
                        obj_ipcq.qnum   = items[4];

                        obj_ipcq.lspid  = items[5];
                        obj_ipcq.lrpid  = items[6];
                        obj_ipcq.owner  = exports.getSysUser(items[7]);

                        obj_ipcq.stime  = exports.dateFormat(new Date(items[11]*1000), "%Y%m%d%H%M%S", false);
                        obj_ipcq.rtime  = exports.dateFormat(new Date(items[12]*1000), "%Y%m%d%H%M%S", false);
                        obj_ipcq.ctime  = exports.dateFormat(new Date(items[13]*1000), "%Y%m%d%H%M%S", false);

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
                        obj_ipcm.key     = exports.decToHex(items[0], 8);
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
  exports.stat_disk(function(result){
    console.log(result[0]);
    var disk ={
      total: Number(result[0].blocks),
      mount: result[0].mount,
      us: Number(result[0].us.replace('%',''))
    };

    return callback(disk);
  })
};
module.exports.get_disk = function(callback){
    execute("df -m | grep -v ^none | ( read header ; echo `$header` ; sort -rn -k 5)", function(result){
      callback(result);
    });
};
module.exports.stat_disk = function ( callback ) {//disk status ##direct-query
  exports.get_disk(function(result){
    var obj_arr = [];
    var arrcnt = 0;
    var loopcnt = 0;

    result.toString().split("\n").forEach( function(line) {
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

            var obj_disk = {};

            var record = line.replace(/\s+/g,' ');
            if( record == null ) {
                    console.log("record is null");
                    return;
            }

            var items = record.split(' ').map(function(item) {
                    return item.trim();
            });
            if( items == null) {
              console.log('items null');
                    return;
            }

            obj_disk.fs = items[0];
            obj_disk.blocks = items[1];
            obj_disk.used = items[2];
            obj_disk.available = items[3];
            obj_disk.us = items[4];
            obj_disk.mount = items[5];

            obj_arr[arrcnt] = obj_disk;
            arrcnt++;
    });
    return callback(obj_arr);
  })

};
