const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const axios = require('axios');

// Server 1
const app1 = express();
app1.use(express.json());
const server1 = http.createServer(app1);
const io1 = new socketIO.Server();

app1.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index1.html'));
});

app1.post('/send-message', (req, res) => {
  const message = req.body.message;

  // Send the message to server2 using an HTTP POST request
  axios.post('http://localhost:4001/receive-message', { message });

  res.send('Message sent to server2');
});

app1.post('/receive-reply', (req, res) => {
  const replyMessage = req.body.message;
  io1.emit('chat message', replyMessage);
  res.send('Reply message received on server1');
});

io1.attach(server1);

io1.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io1.emit('chat message', msg);
  });
});

server1.listen(4000, () => {
  console.log('<http># server running at http://localhost:4000');
});


// Server 2
const app2 = express();
app2.use(express.json());
const server2 = http.createServer(app2);
const io2 = new socketIO.Server();

app2.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index2.html'));
});

app2.post('/send-message', (req, res) => {
  const message = req.body.message;

  // Send the message to server1 using an HTTP POST request
  axios.post('http://localhost:4000/receive-message', { message });

  res.send('Message sent to server1');
});

app2.post('/receive-message', (req, res) => {
  const receivedMessage = req.body.message;

  // Broadcast the received message to all connected clients on server2
  io2.emit('chat message', receivedMessage);

  // Create a reply message
  const replyMessage = `Server2: Thank you for your message - "${receivedMessage}"`;

  // Send the reply message to server1 using an HTTP POST request
  axios.post('http://localhost:4000/receive-reply', { message: replyMessage });

  res.send('Message received on server2. Reply sent to server1.');
});

io2.attach(server2);

io2.on('connection', (socket) => {
  // No need to handle 'chat message' events here as they are handled separately
});

server2.listen(4001, () => {
  console.log('<http># server running at http://localhost:4001');
});
