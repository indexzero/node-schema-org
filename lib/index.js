/*
 * index.js: Top-level include for the node-schema-org module.
 *
 * (C) 2011 Charlie Robbins.
 *
 */

var winston = require('winston');

var schemaOrg = exports;

//
// Expose properties from `pkginfo`.
//
require('pkginfo')(module, 'version');

//
// Expose appropriate methods on `node-schema-org`.
//
schemaOrg.cache = require('./cache');
schemaOrg.read  = require('./read');
schemaOrg.list  = require('./list');

//
// Create an instance of `winston.Logger` to use in 
// this module.
//
schemaOrg.logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});