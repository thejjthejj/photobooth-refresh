const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    nunjucks = require('nunjucks');

let port = process.env.PORT || 8888;

nunjucks.configure('src/views', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(express.static(__dirname + '/src/assets'));


const test = "test1";

io.on('connection', function(socket){

    socket.on('torch', function (state) {
        console.log("torch:", state);

        io.emit('torchToggle', state)
    });

    socket.on('test', function (msg) {
        console.log("test:", msg);

        io.emit('testAgain', msg);
    });

    socket.on('disconnect', function () {
        console.log('disconnect');
    });
});

app.get('/', function(req, res) {
    res.render('index.html', {

    })
});


http.listen(port, function(){
    console.log('listening on *:' + port);
});