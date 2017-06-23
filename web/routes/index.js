var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var socket = require('../conn_socket.js');
var io = require('socket.io');
var session = require('express-session');
var router = express.Router();


router.get('/', function(req, res, next) {
  var sess = req.session;

  if (req.session.username) {
    res.redirect('/main');
  } else {
    res.render('index.ejs')
  }
});

router.post('/signin', function(req, res, next) {
  var sess = req.session;
  var user = {
    username : req.body.username,
    password : req.body.password
  };

  if ( user.username === 'admin' && user.password === 'cs2017' ) {
    req.session.username = user.username;
    req.session.login_token = 'login1';//###NEED MAKING RULE MORE WEB CLIENT COMMING
    // sess.dstkey = 'a52ER2###@DFDDQQ$FBPF!#)';

    socket.emit('join', sess.login_token);//PRIVATE COMMUNICATION

    res.redirect('/main');
  } else {
    res.redirect('/');
  }

});
router.get('/signout', function(req, res, next) {
  if( req.session.username) {
    req.session.destroy(function (err) {
     req.session;
    });
    res.redirect('/main');
  } else {
   res.redirect('/main')
 }
});
router.get('/main', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('main.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_info', function(req, res, next) {
  var sess = req.session;

  if (sess.username) res.render('stat_info.ejs'); else res.redirect('/main');
});
router.get('/usage_status', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_status.ejs');
  } else {
    res.redirect('/main');
  }
});
router.get('/usage_cpu', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_cpu.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/main');
  }
});
router.get('/stat_prcs', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_prcs.ejs');
  } else {
    res.redirect('/main');
  }
});
router.get('/usage_mem', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_mem.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/main');
  }
});
router.get('/usage_tcp', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_tcp.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/main');
  }
});
router.get('/stat_net', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_net.ejs')
  } else {
    res.redirect('/main');
  }
});
router.get('/stat_ipcq', function(req, res, next) {
  var sess = req.session;


  if (sess.username) {
    res.render('stat_ipcq.ejs')
  } else {
    res.redirect('/main');
  }
});
router.get('/stat_ipcm', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_ipcm.ejs');
  } else {
    res.redirect('/main');
  }
});
router.get('/usage_disk', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_disk.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/main');
  }
});
router.get('/stat_disk', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_disk.ejs');
  } else {//URL DEFENCE
    res.redirect('/main');
  }
});
module.exports = router;
