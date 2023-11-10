const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server);

app.get('/', (req, res) => {
  // Replace 'index.html' with the actual path to your HTML file.
  res.sendFile(path.join(__dirname,'src', 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(3000, () => {
  console.log('<http># server running at http://localhost:3000');
});
