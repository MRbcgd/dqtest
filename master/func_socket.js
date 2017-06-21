// var default_ip = '192.168.20.129';
var default_ip = '192.168.122.1';

module.exports.ip_check = function (socket) {
  //IP CHECK
  socket.on('ip_check', function (message) {
    var svrkey = null;

    if (message.data === default_ip) {//DEFAULT IP
      console.log('Accessible IP: Agent1');

      svrkey = 'a52ER2###@DFDDQQ$FBPF!#)';
    } else {
      console.log('Inaccessible IP: ', message.data);

      svrkey = 'fail';
    }

    socket.emit('ip_result', { data: svrkey });
  });
};
