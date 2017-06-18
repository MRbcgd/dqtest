'use strict'

var exec = require('child_process').exec

function splitByWhitespaces (str) {
  return str.match(/\S+/g)
}

function ps (options, cb) {
  exec('ps ' + options, function (err, stdout, stderr) {
    if (err) cb(err)
    else if (stderr) cb(new Error(stderr))
    else cb(null, stdout)
  })
}

function getKeywords (cb) {
  ps('-L', function (err, result) {
    if (err) cb(err)
    else cb(null, splitByWhitespaces(result))
  })
}

function lookup (options, cb) {
  var pid = options.pid || process.pid
  ps('-p ' + pid + ' -o ' + options.keywords.join(','), function (err, stdout) {
    if (err) {
      cb(err)
      return
    }

    var lines = stdout.split('\n')
    if (!lines[1]) {
      cb(new Error('process with pid ' + pid + ' not found'))
      return
    }

    var result = {}
    var headerCols = splitByWhitespaces(lines[0])
    var resultCols = splitByWhitespaces(lines[1])
    headerCols.forEach(function (col, i) {
      result[col.toLowerCase()] = resultCols[i]
    })
    cb(null, result)
  })
}

module.exports.lookup = lookup
module.exports.getKeywords = getKeywords
