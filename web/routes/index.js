var express = require('express');
var fs = require('fs');
var ejs = require('ejs');

var socket = require('../conn_socket.js');

var router = express.Router();

router.get('/', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.redirect('/main');
  } else {
    res.render('index.ejs')
  }
});

router.post('/signin', function(req, res, next) {

  var user = {
    username : req.body.username,
    password : req.body.password
  };

  if ( user.username !== 'test' && user.password !== 'test') {
    req.session.username = user.username;
    req.session.login_token = 'test';
    req.session.dstkey = '9525!@#!$#^&*&^%$DFGHJ#@!#$NN651%@';

    socket.emit('join', req.session.dstkey);//PRIVATE COMMUNICATION
    console.log('');
    res.redirect('/main');
  } else {
    res.redirect('/');
  }

});
router.get('/signout', function(req, res, next) {
  if( req.session.username ) {
    req.session.destroy(function(err){
     if (err) {
       throw err;
     }
     res.redirect('/')
   });
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
  var packet = {
    head: {
      login_token : req.session.login_token,
      svccd : 'stat_info',
      query_type : 'direct',
    },
    input: { dstkey : req.session.dstkey }
  };

  if (sess.username) {
    console.log('Send packet to master');
    socket.emit('stat_info_wm', packet);//DIRECT QUERY WEB TO MASTER

    res.render('stat_info.ejs', {
      username: sess.username
    });

  } else {
    res.redirect('/');
  }
});
router.get('/usage_status', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_status.ejs');
  } else {
    res.redirect('/');
  }
});
router.get('/usage_cpu', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_cpu.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_prcs', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_prcs.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/usage_mem', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_mem.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/usage_tcp', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_tcp.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_net', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_net.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_ipcq', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_ipcq.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_ipcm', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_ipcm.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/usage_disk', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('usage_disk.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_disk', function(req, res, next) {
  var sess = req.session;

  if (sess.username) {
    res.render('stat_disk.ejs', {
      username: sess.username
    });
  } else {
    res.redirect('/');
  }
});
module.exports = router;
