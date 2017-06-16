module.exports.ip_check = function (socket) {
  //IP CHECK
  socket.on('ip_check', function (message) {
    var svrkey = null;

    if (message.data === '192.168.195.1') {//DEFAULT IP
      console.log('Accessible IP: Agent1');

      svrkey = 'a52ER2###@DFDDQQ$FBPF!#)(*<NSam%T%GdDF)';
    } else {
      console.log('Inaccessible IP: ', message.data);

      svrkey = 'fail';
    }

    socket.emit('ip_result', { data: svrkey });
  });
};
