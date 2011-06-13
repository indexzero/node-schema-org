/*
 * cache.js: Local cache of schemas already loaded.
 *
 * (C) 2011 Charlie Robbins.
 *
 */
 
var fs = require('fs');
 
var cache = {};

//
// ### function get (type)
// #### @type {string} Type of the schema to get
// Returns the schema with the specified `type` from the cache.
//
exports.get = function (type) {
  var type = schema.type.toLowerCase();
  return cache[type] ? cache[type] : null;
};

//
// ### function put (schema)
// #### @schema {Object} Schema to put in the cache
// Puts the `schema` into the cache using the `schema.type`
// as the target cache key.
//
exports.put = function (schema) {
  if (!schema.type) {
    return false;
  }
  
  var type = schema.type.toLowerCase();
  cache[type] = schema;
  return true;
};

//
// ### function putFile (type, filename, callback)
// #### @type {string} Type to put the contents into the cache as.
// #### @filename {string} Filename to read into the cache.
// #### @callback {function} Continuation to respond to when complete.
// Reads the contents at the specified `filename` and puts it into the 
// cache under the specified `type`.
//
exports.putFile = function (type, filename, callback) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      return callback(err);
    }
    
    try {
      data = JSON.parse(data.toString());
    }
    catch (ex) {
      return callback(ex);
    }
    
    if (!data.type) {
      data = {
        type: type,
        schemas: data.schemas
      };
    }
    
    //
    // Cache the schema we just parsed.
    //
    exports.put(data);
    callback(null, data);
  });
};