/*
 * parse.js: Responsible for parsing an indivudal schema from http://schema.org.
 *
 * (C) 2011 Charlie Robbins.
 *
 */
 
var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    argv = require('optimist').argv,
    colors = require('colors'),
    jsdom = require('jsdom'),
    request = require('request'),
    validator = require('validator'),
    schemaOrg = require('./index');

var read = exports;

//
// ### function local (options, callback)
// #### @options {Object} Options to use when parsing the local schema
// #### @callback {function} Continuation to respond to when complete.
// Reads the local schema using the specified `options`.
//
read.local = function (options, callback) {
  //
  // If there is no `options.type` we cannot create a target url.
  //
  if (!options.type) {
    return callback(new Error('Cannot parse schema with no type.'));
  }

  //
  // If there is a cached version of this schema and we have not
  // been indicated to force the download, return.
  //
  if (serveCache(options, callback)) {
    return;
  }
  
  options.schemaDir = options.schemaDir || path.join(__dirname, '..', 'schemas');
  options.filename  = options.filename  || type.toLowerCase() + '.json';
  
  var type       = options.type,
      schemaFile = path.join(options.schemaDir, options.filename);
      
  schemaOrg.putFile(options.type, schemaFile, callback);
};

//
// ### function remote (options, callback)
// #### @options {Object} Options to use when parsing the remote schema.
// #### @callback {function} Continuation to respond to when complete.
// Reads and parses the remote version of `options.schema`, saves it locally,
// caches it and returns the resulting schemas.
//
read.remote = function (options, callback) {
  //
  // If there is no `options.type` we cannot create a target url.
  //
  if (!options.type) {
    return callback(new Error('Cannot parse schema with no type.'));
  }

  //
  // If there is a cached version of this schema and we have not
  // been indicated to force the download, return.
  //
  if (serveCache(options, callback)) {
    return;
  } 
  
  options.schemaDir = options.schemaDir || path.join(__dirname, '..', 'schemas');
  options.filename  = options.filename  || options.type.toLowerCase() + '.json';
  
  var type       = options.type,
      schemaFile = path.join(options.schemaDir, options.filename);
  
  read.realName(options, function (err, realName) {
    if (err) {
      return callback(err);
    }
    
    var url = 'http://schema.org/' + realName;
    
    //
    // Request the URL which contains the schema information
    //
    schemaOrg.logger.info('Contacting: ' + url.green);
    request({ uri: url }, function (error, response, body) {
      if (error && response.statusCode !== 200) {
        console.log('Error when contacting: ' + url);
        return callback(error);
      }

      //
      // Parse the resulting HTML using jQuery
      //
      schemaOrg.logger.info('Parsing: ' + url.green);  
      jsdom.env({
        html: body,
        scripts: [
          'http://code.jquery.com/jquery-1.5.min.js'
        ]
      }, function (err, window) {
        var $ = window.jQuery,
            schema = { type: type };

        schemaOrg.logger.info('Reading: ' + url.green);

        // Look for version information and add if found
        var version = $('.version'); // e.g. <div class="version">Schema Draft Version 0.9</div>
        if (version) schema.version = version.html().replace(/^\s+/, '').replace(/\s+$/, '');

        //
        // Iterate over the set of `tbody` tags in the `.definition-table`.
        // getting the associated `thead` element for each tag and converting 
        // the contents to JSON accordingly.
        //
        $('.definition-table tbody').each(function (i, body) {
          var jbody = $(body),
              head = jbody.prev(),
              propList = [];

          var currentType = $(head.find('th a')[0]).html().trim();
          schemaOrg.logger.info('Parsing Type: ' + currentType.magenta);

          var html = jbody.html(),
              theadIndex = html.indexOf('<thead');

          //
          // If there is any `<thead*` HTML in the `tbody` tag then 
          // remove it. This avoids unexpected behavior from malformed
          // HTML.
          //
          if (theadIndex > 0) {
            jbody = $('<tbody>' + html.substr(0, theadIndex) + '</tbody>');
          }

          //
          // Iterate over each `tr` within the `tbody`, creating a property
          // in the current type (or base type) appropriately. 
          //
          jbody.find('tr').each(function (i, tr) {
            var jtr = $(tr), 
                types = [],
                desc =  $(jtr.find('td.prop-desc')[0]).html(),
                prop;

            if (desc) {
              desc = validator.entities.decode(desc).replace(/<.*?>/g, '');
            }

            prop = {
              name: $(jtr.find('th code')[0]).html(),
              description: desc
            };

            //
            // If the property has multiple types, set the `type`
            // property to be an Array and sanitize any anchor tags.
            //
            var ptype = $(jtr.find('td.prop-ect')[0]),
                atypes = $(ptype.find('a'));

            if (atypes.length > 0) {
              atypes.each(function (i, el) { types.push($(el).html()) });
              prop.type = types.length === 1 ? types[0] : types;
            }
            else {
              prop.type = ptype.html().replace(/\s/g, '');
            }

            propList.push(prop);
          });

          //
          // If we are parsing the current type specified by `options.type`
          // then set the list of properties obtained on that type.
          //
          if (currentType === type) {
            return schema.properties = propList;
          }

          //
          // Otherwise set the property list of the type that has been parsed
          // on the `schema.bases` object which represents all base types which
          // the current type depends on.
          //
          schema.bases = schema.bases || {};
          schema.bases[currentType] = propList;
        });

        schemaOrg.logger.info('Writing schema: ' + schemaFile.magenta);
        exec('mkdir -p ' + options.schemaDir, function (err) {
          if (err) {
            return callback(err);
          }

          fs.writeFile(schemaFile, JSON.stringify(schema, null, 2), function (err) {
            if (err) {
              return callback(err);
            }

            schemaOrg.logger.info('Done parsing schema: ' + schemaFile.magenta);
            schemaOrg.cache.put(schema);
            callback(null, schema);
          });    
        });
      });
    });
  });
};

//
// ### function realName (options, callback)
// #### @type {string|Object} Type of the schema to find the real name for
//
read.realName = function (options, callback) {
  options = typeof options === 'object' ? options : { type: options };
  
  if (!options.type) {
    return callback(new Error('Type is required when finding real name.'));
  }
  
  var listOptions = {
    schemaDir: options.schemaDir
  };
  
  schemaOrg.list.local(listOptions, function (err, schemas) {
    if (err) {
      return callback(err);
    }

    
    var realName = schemas.filter(function (name) {
      return name.toLowerCase() === options.type.toLowerCase();
    })[0];
    
    return !realName 
      ? callback(new Error('Cannot find realname for type: ' + options.type))
      : callback(null, realName);
  });
};

//
// ### @private function serveCache (callback)
// #### @callback {function} Continuation to respond to with the cache
// Helper function to server a cached version if it exists.
//
function serveCache (options, callback) {
  if (schemaOrg.cache.get[options.type] && !options.force) {
    //
    // If the schema exists in the cache and we have not been 
    // indicated to force the download, return the cached version.
    //
    callback(null, schemaOrg.cache.get[options.type]);
    return true;
  }
  
  return false;
}
