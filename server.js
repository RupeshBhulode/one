const express = require('express');
const app = express();
const http = require('http').createServer(app);
const PORT = process.env.PORT ;

const io = require('socket.io')(http);

// Define connectedUsers set at a higher scope
const connectedUsers = new Set();

io.on('connection', (socket) => {
    console.log('Connected...');

    // Listen for the 'join' event when a user joins the chat
    socket.on('join', (userName) => {
        connectedUsers.add(userName);
        const joinMessage = `${userName} joined the chat`;
        socket.broadcast.emit('message', { user: 'System', message: joinMessage }); // Emit a system message
    });
    
    socket.on('leave', (userName) => {
        connectedUsers.delete(userName);
        const leaveMessage = `${userName} left the chat`;
        socket.broadcast.emit('message', { user: 'System', message: leaveMessage }); // Emit a system message
    });

    // Listen for the 'message' event
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg);
    });

    // Send the list of connected users to the newly connected client
    socket.emit('users', Array.from(connectedUsers));
});

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
