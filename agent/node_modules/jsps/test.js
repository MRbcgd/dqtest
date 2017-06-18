'use strict'

var ps = require('./index')
var assert = require('assert')

// keywords
ps.getKeywords(function (err, keywords) {
  assert(err === null)
  assert(Array.isArray(keywords))
  assert(keywords.length > 0)
})

// default pid
ps.lookup({keywords: ['%cpu', '%mem']}, function (err, result) {
  assert(err === null)
  // lowercased
  assert.equal(typeof result['%cpu'], 'string')
  assert.equal(typeof result['%mem'], 'string')
  assert.equal(Object.keys(result).length, 2)
})

// with pid not found
ps.lookup({keywords: ['%cpu', '%mem'], pid: 6666}, function (err, result) {
  assert(err instanceof Error)
  assert(result === undefined)
})
