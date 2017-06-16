var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/signin', function(req, res, next) {
  var result = {
    head : {},
    error : {}
  };
  var user = {
    username : req.body.username,
    password : req.body.password
  };

  if ( user.username === 'test' && user.password === 'test') {
    req.session.username = user.username;
    req.session.login_token = 'test';
    result.head.login_token = req.session.login_token;
    result.error.code = 0;
    result.error.mesg = 'correct user and pwd';
  } else {
    result.error.code = 101,
    result.error.mesg = 'incorrect user or pwd'
  }

  res.json(result);
});
router.get('/signout', function(req, res, next) {
  if( req.session.username ) {
    req.session.destroy(function(err){
     if (err) {
       throw err;
     }
     res.send('signout')
   });
 } else {
   res.send('no user data');
 }

})

module.exports = router;
