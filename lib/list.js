var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    colors = require('colors'),
    jsdom = require('jsdom')
    request = require('request'),
    winston = require('winston').cli();

var url = 'http://schema.org/docs/full.html'

winston.info('Contacting: ' + url.green);
request({ uri: url }, function (error, response, body) {
  if (error && response.statusCode !== 200) {
    console.log('Error when contacting: ' + url);
  }

  winston.info('Parsing: ' + url.green);  
  jsdom.env({
    html: body,
    scripts: [
      'http://code.jquery.com/jquery-1.5.min.js'
    ]
  }, function (err, window) {
    var $ = window.jQuery,
        schemaDir = path.join(__dirname, 'schemas'),
        listFile = path.join(schemaDir, 'schema-list.json'),
        schemas = [];
    
    winston.info('Reading: ' + url.green);
    $('a').each(function (i, el) {
      var match = schema = path.basename(el.href);
      if (!~['list-schemas.js', 'documents.html', 'schemas.html', '#'].indexOf(schema)) {
        if ((match = schema.match(/list-schemas.js\#(\w+)/))) {
          return schemas.push(match[1]);
        }
        
        schemas.push(schema);
      }
    });
    
    var result = JSON.stringify({
      schemas: schemas
    }, null, 2);
    
    winston.info('Saving results to: ' + listFile.green);
    exec('mkdir -p ' + schemaDir, function () {
      fs.writeFile(listFile, result, function () {
        winston.info('Done creating ' + listFile.green + ' from ' + url.magenta);
      });
    });
  });
});