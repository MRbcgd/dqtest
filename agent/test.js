var express = require('express');

var socket = require('socket.io')(http);

var app = express();
var http = require('http').Server(app);

http.listen(52273, function(){
  console.log('server running at 52273');
});


socket.on('connection', function () {
  console.log('web server 또는 client에서 접속시도가 있습니다.');

  // socket.on('dc_master2agent', function (data) {
  //   console.log('master에서 수신했으며 이 데이터는 agent에서 보내온 데이터 캡쳐에 대한 성공여부입니다.');
  // });
  //
  // socket.on('dq_web2master', function (data) {
  //   console.log('master에서 수신했으며 이 데이터는 web에서 보내온 direct query입니다.');
  //
  //   socket.emit('dq_master2agent',{ data : 'data'}); //추후에 idsc를 위하여 id로 구분해줌.
  // });
  //
  // socket.on('dq_agent2master', function (data) {
  //   console.log('master에서 수신했으며 이 데이터는 agent에서 보내온 direct query의 결과 값입니다.');
  //
  //   socket.emit('dq_master2web', { data : 'datacaputure 성공적으로 도착했습니다.'});
  // });

});
