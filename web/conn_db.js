module.exports = function () {
  var mysql = require('mysql');

  var conn = mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'qkrcjfgud12',
      database: 'server_monitoring',
      multipleStatements: true
  });
  conn.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + conn.threadId);
  });

  return conn;
}
