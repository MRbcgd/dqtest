var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  // socket.emit('dq_web2master', { data : 'directquery를 위해 마스터에 요청' });
  // socket.on('dq_master2web', function(data){
  //   console.log('web에서 수신했으며 이 데이터는 마스터 서버에서 direct query에 의해서 날라온 데이터 입니다.');
  //
  //   console.log(data);
  // });
  res.render('index', { title: 'Express' });
});

module.exports = router;
