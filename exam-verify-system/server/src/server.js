import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import { initSocket } from './socket/index.js';

// ... load env ...
// ... database ...
// ... server setup ...

// ── Socket.io Setup ──
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

initSocket(io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ── Start Server ──
const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();
