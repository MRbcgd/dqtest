console.log('1');
// Connect to server
var io = require('socket.io-client');
var socket = io.connect('http://localhost:52273', {reconnect: true});

console.log('2');

// Add a connect listener
socket.on('connect', function(socket) {
  console.log('Connected!');
});
socket.emit('am',{data:'am'});
socket.on('ma',function(data){
  console.log(data);
})

console.log('3');


// var io = require('socket.io-client');
// var socket = io.connect('http://localhost:52273', {reconnect : true });
// // process.stdin.resume();
// // process.stdin.setEncoding('utf8');
// //
// // process.stdin.on('data', function(chunk) {
// //     process.stdout.write('data' + chunk);
// // });
// //
// // process.stdin.on('end', function() {
// //     process.stdout.write('end');
// // });
// console.log('1');
// socket.on('connect', function(){
//   console.log('agent에서 master 서버로 포트가 통신이 되었습니다.');
// });
// console.log('2');
//
// // socket.emit('dc_agent2master', { data : 'capture data' });
// //
// // socket.on('dc_master2agent', function (result) {//data capture 결과
// //   console.log('agent에서 수신했으면 이 데이터는 마스터 서버에서 데이터캡쳐에 대한 결과입니다.');
// //   console.log(result);
// // });
// //
// // socket.on('dq_master2agent', function (result) {
// //   console.log('agent에서 수신했으며 이 데이터는 마스터 서버에서 보내 온 directquery 요청입니다.');
// //   socket.emit('dq_agent2master', { data : '리소스'} );
// // });
