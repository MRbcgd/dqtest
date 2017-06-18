var express = require('express');
var fs = require('fs');
var ejs = require('ejs');

var socket = require('../conn_socket.js');

var router = express.Router();

var pacekt = {
  head: {},
  input: {}
};

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
    req.session.dstkey = 'a52ER2###@DFDDQQ$FBPF!#';

    socket.emit('join', 'web_socketid');//PRIVATE COMMUNICATION
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
router.get('/stat_info', function(req, res) {
  var sess = req.session;

  packet = {
    head: {
      login_token : req.session.login_token,
      svccd : 'stat_info',
      query_type : 'direct',
      dstkey: req.session.dstkey
    },
    input: {},
    output: {}
  };

  if (sess.username) {

    socket.emit('stat_info_wm', packet);//DIRECT QUERY WEB TO MASTER
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);

    socket.on('stat_info_mw', function (message) {
      console.log('#####################'); console.log('Receive packet from master'); console.log(message);
      if ( message.head.login_token !== req.session.login_token) {
        console.log('Incorrect login token: ERR- SESSION DESTROY');

        req.session.destroy(function(err){//INCORRECT USER
         if (err) {
           throw err;
         }
         res.redirect('/')
       });
      }
      else if ( message.error.code !== 0 ) {//REPRESENT PACKET
        socket.emit('stat_info_wm', packet); console.log('Send packet to master: ERR- REPRESENT');
      }
      else {//RESULT
        console.log('####################'); console.log('Query sucess');console.log(message);

        // res.render('stat_info.ejs');
      }
    });
  } else {//URL DEFENCE
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

  packet = {
    head: {
      login_token : req.session.login_token,
      svccd : 'stat_net',
      query_type : 'direct',
      dstkey: req.session.dstkey
    },
    input: {},
    output: {}
  };

  if (sess.username) {

    socket.emit('stat_net_wm', packet);//DIRECT QUERY WEB TO MASTER
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);

    socket.on('stat_net_mw', function (message) {
      console.log('#####################'); console.log('Receive packet from master'); console.log(message);
      if ( message.head.login_token !== req.session.login_token) {
        console.log('Incorrect login token: ERR- SESSION DESTROY');

        req.session.destroy(function(err){//INCORRECT USER
         if (err) {
           throw err;
         }
         res.redirect('/')
       });
      }
      else if ( message.error.code !== 0 ) {//REPRESENT PACKET
        socket.emit('stat_net_wm', packet); console.log('Send packet to master: ERR- REPRESENT');
      }
      else {//RESULT
        console.log('####################'); console.log('Query sucess');console.log(message);

        // res.render('stat_disk.ejs');
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_ipcq', function(req, res, next) {
  var sess = req.session;

  packet = {
    head: {
      login_token : req.session.login_token,
      svccd : 'stat_ipcq',
      query_type : 'direct',
      dstkey: req.session.dstkey
    },
    input: {},
    output: {}
  };

  if (sess.username) {
    socket.emit('stat_ipcq_wm', packet);//DIRECT QUERY WEB TO MASTER
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);

    socket.on('stat_ipcq_mw', function (message) {
      console.log('#####################'); console.log('Receive packet from master'); console.log(message);
      if ( message.head.login_token !== req.session.login_token) {
        console.log('Incorrect login token: ERR- SESSION DESTROY');

        req.session.destroy(function(err){//INCORRECT USER
         if (err) {
           throw err;
         }
         res.redirect('/')
       });
      }
      else if ( message.error.code !== 0 ) {//REPRESENT PACKET
        socket.emit('stat_ipcq_wm', packet); console.log('Send packet to master: ERR- REPRESENT');
      }
      else {//RESULT
        console.log('####################'); console.log('Query sucess');console.log(message);

        // res.render('stat_disk.ejs');
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/stat_ipcm', function(req, res, next) {
  var sess = req.session;

  packet = {
    head: {
      login_token : req.session.login_token,
      svccd : 'stat_ipcm',
      query_type : 'direct',
      dstkey: req.session.dstkey
    },
    input: {},
    output: {}
  };

  if (sess.username) {
    socket.emit('stat_ipcm_wm', packet);//DIRECT QUERY WEB TO MASTER
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);

    socket.on('stat_ipcm_mw', function (message) {
      console.log('#####################'); console.log('Receive packet from master'); console.log(message);
      if ( message.head.login_token !== req.session.login_token) {
        console.log('Incorrect login token: ERR- SESSION DESTROY');

        req.session.destroy(function(err){//INCORRECT USER
         if (err) {
           throw err;
         }
         res.redirect('/')
       });
      }
      else if ( message.error.code !== 0 ) {//REPRESENT PACKET
        socket.emit('stat_ipcm_wm', packet); console.log('Send packet to master: ERR- REPRESENT');
      }
      else {//RESULT
        console.log('####################'); console.log('Query sucess');console.log(message);

        // res.render('stat_disk.ejs');
      }
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

  packet = {
    head: {
      login_token : req.session.login_token,
      svccd : 'stat_disk',
      query_type : 'direct',
      dstkey: req.session.dstkey
    },
    input: {},
    output: {}
  };

  if (sess.username) {

    socket.emit('stat_disk_wm', packet);//DIRECT QUERY WEB TO MASTER
    console.log('#####################'); console.log('Send packet to master'); console.log(packet);

    socket.on('stat_disk_mw', function (message) {
      console.log('#####################'); console.log('Receive packet from master'); console.log(message);
      if ( message.head.login_token !== req.session.login_token) {
        console.log('Incorrect login token: ERR- SESSION DESTROY');

        req.session.destroy(function(err){//INCORRECT USER
         if (err) {
           throw err;
         }
         res.redirect('/')
       });
      }
      else if ( message.error.code !== 0 ) {//REPRESENT PACKET
        socket.emit('stat_disk_wm', packet); console.log('Send packet to master: ERR- REPRESENT');
      }
      else {//RESULT
        console.log('####################'); console.log('Query sucess');console.log(message);

        // res.render('stat_disk.ejs');
      }
    });
  } else {//URL DEFENCE
    res.redirect('/');
  }
});
module.exports = router;
