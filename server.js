//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');

var server = require('http').Server(app);
var config = require('./config');
const redis =   require('redis');
const io =      require('socket.io').listen(server);
const client =  redis.createClient(14561, 'redis-14561.c8.us-east-1-3.ec2.cloud.redislabs.com',{});

client.auth("silahkanmasuk123"); 



app.engine('html', require('ejs').renderFile);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

app.get('/', function (req, res) {
    res.render('index.html', { pageCountMessage : null});
});

server.listen(port,ip,function() {

  console.log("Server running @ http://" + config.serverip + ":" + config.serverport);

});


