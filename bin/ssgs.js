#!/usr/bin/env node

var myArgs  = require('optimist').argv;
var ssgs = require('../lib/index.js');

ssgs(myArgs);