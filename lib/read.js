var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    argv = require('optimist').argv,
    colors = require('colors'),
    request = require('request'),
    jsdom = require('jsdom'),
    validator = require('validator'),
    winston = require('winston').cli();

var type = argv.type,
    url = 'http://schema.org/' + type

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
        schemaFile = path.join(schemaDir, type.toLowerCase() + '.json'),
        schema = { type: type };
            
    winston.info('Reading: ' + url.green);
    
    $('.definition-table tbody').each(function (i, body) {
      var jbody = $(body),
          head = jbody.prev(),
          propList = [];

      var currentType = $(head.find('th a')[0]).html().trim();
      winston.info('Parsing Type: ' + currentType.magenta);
      
      var html = jbody.html(),
          theadIndex = html.indexOf('<thead');
      
      if (theadIndex > 0) {
        jbody = $('<tbody>' + html.substr(0, theadIndex) + '</tbody>');
      }
            
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
        
        var ptype = $(jtr.find('td.prop-ect')[0]),
            atypes = $(ptype.find('a'));
        
        if (atypes.length > 0) {
          atypes.each(function (i, el) { types.push($(el).html()) });
          prop.type = types.length === 1 ? types[0] : types;
        }
        else {
          prop.type = ptype.html();
        }
        
        propList.push(prop);
      });
      
      if (currentType === type) {
        return schema.properties = propList;
      }
      
      schema.bases = schema.bases || {};
      schema.bases[currentType] = propList;
    });
    
    winston.info('Writing schema: ' + schemaFile.magenta);
    exec('mkdir -p ' + schemaDir, function () {
      fs.writeFile(schemaFile, JSON.stringify(schema, null, 2), function () {
        winston.info('Done parsing schema: ' + schemaFile.magenta);
      });    
    });
  });
});