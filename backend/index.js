const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

let rooms = {};  // Holds active rooms and users

// Serve static files (frontend)
app.use(express.static('frontend'));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New user connected');

    // Handle username validation
    socket.on('validate username', (username, callback) => {
        const usernameRegex = /^[A-Za-z0-9~`!@#$%^&*()+=_\-{}[\]|:;”’?/<>,.]{6,20}$/;
        if (usernameRegex.test(username)) {
            callback({ valid: true });
        } else {
            callback({ valid: false, message: 'Invalid username format' });
        }
    });

    // Handle room creation (Holder)
    socket.on('create room', (username) => {
        const roomNumber = Math.floor(100000000 + Math.random() * 900000000); // Generate 9-digit room number
        rooms[roomNumber] = { holder: username, users: [username] };
        socket.join(roomNumber);
        io.to(socket.id).emit('room created', roomNumber);
        console.log(`Room ${roomNumber} created by ${username}`);
    });

    // Handle joining room (Participant)
    socket.on('join room', (roomNumber, username, callback) => {
        if (rooms[roomNumber]) {
            rooms[roomNumber].users.push(username);
            socket.join(roomNumber);
            io.to(roomNumber).emit('user joined', username);
            callback({ success: true });
        } else {
            callback({ success: false, message: 'Room number not found' });
        }
    });

    // Handle chat messages
    socket.on('chat message', (roomNumber, msg) => {
        io.to(roomNumber).emit('chat message', msg);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
