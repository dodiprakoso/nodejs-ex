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




var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

/*app.engine('html', require('ejs').renderFile);
app.get('/', function (req, res) {
    res.render('index.html', { pageCountMessage : null});
});*/

server.listen(port,ip,function() {

  console.log("Server running @ http://" + ip + ":" + port);

});


 // Allow some files to be server over HTTP
app.use(express.static(__dirname + '/'));

// Serve GET on http://domain/
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Server GET on http://domain/api/config
// A hack to provide client the system config
app.get('/api/config', function(req, res) {
  res.send('var config = ' + JSON.stringify(config));
}); 

/**
* On Connection
*
**/

io.sockets.on('connection', function(client) {

    client.emit("status", "Now, we are connected to server");

    /**
    * Create room for userr and conv
    *
    **/

    client.on('subscribe', function(room) {
        
        console.log("isi client.rooms : ");
        console.log(client.rooms);

        // if(!client.rooms.indexOf(room) >= 0){
            
            console.log('joining room', room);
            client.join(room);  

        // }

    });

    /**
    * Message and conversation
    *
    **/

    client.on('create message', function(data) {

        console.log('create room post', data.data.id);
        io.sockets.in(data.data.to.user.user_permalink).emit('new message', data.data);

    });

    client.on('subscribe conversations', function(room) {
        console.log('joining room conv', room);
        client.join(room);
    });

    client.on('send message', function(data) {
        console.log('sending room post', data.room);
        client.broadcast.to(data.room).emit('conversation private post', data.message);
    });

    client.on('remove message', function(data) {

        client.broadcast.to(data.room).emit('conversation remove', data.data);

        //remove the room
        console.log('remove room post', data.room);
        client.leave(data.room);

    });

    /**
    * Redis server auth
    *
    **/
    const redisClient = redis.createClient(14561, 'redis-14561.c8.us-east-1-3.ec2.cloud.redislabs.com',{});

    redisClient.auth("silahkanmasuk123"); 

    /**
    * Subscribe to user.change
    *
    **/

    redisClient.subscribe('user.change');

    redisClient.on("message", function(channel, data) {

        data = JSON.parse(data);

        if(data.user){      

            io.sockets.in(data.user.user_permalink).emit(channel, data);

        }        

    });

    /**
    * On current connection disconnect
    *
    **/

    client.on('disconnect', function() { 
        console.log('A user disconnected');
        redisClient.quit();
    });
});

