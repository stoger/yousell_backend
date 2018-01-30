let express = require('express'),
    router = express(),
    path = require('path'),
    http = require('http').createServer(router),
    io = require('socket.io');

let socket = io();
// router.set('views', path.join(__dirname, '../views'));
// router.set('view engine', 'jade');

let chat = function() {
    socket.on('connection', (cli) => {
        console.log('Connected');

        // console.log(cli);
        cli.on('message', (content) => {
            console.log('Message received!');
            console.log(content);
        });
        // console.log(cli);
    });

    socket.on('message', () => {
        console.log('Messsaged')
    });

    socket.on('receive', () => {
       console.log('Received');
    });

    socket.on('connect_error', () => {
        console.error('Failed to connect to server');
    })
};

let setServerForChat = function(server) {
    console.log('Setting server...');
    console.log(socket);
    socket = io.listen(server);
};

module.exports = setServerForChat();
module.exports = chat;