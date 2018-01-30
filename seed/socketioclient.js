let io = require('socket.io-client');

let socket = io.connect('http://localhost:3000');

socket.on('event', () => {
    console.log('CLIENT WORKS');
});


console.log('RUNNING');