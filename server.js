'use strict';

var restify = require('restify');
var path = require('path');
var nconf = require('nconf').file({
    file: path.join(__dirname, 'config', 'global.json')
});

var server = restify.createServer();
server.use(restify.CORS());

var port = process.env.PORT || nconf.get('Server:Port');

require('./api/api.routes')(server);

server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
});