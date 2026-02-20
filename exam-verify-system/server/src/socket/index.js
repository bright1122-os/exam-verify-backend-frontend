let io;

export const initSocket = (socketIoInstance) => {
    io = socketIoInstance;

    io.on('connection', (socket) => {
        console.log('Socket Connected:', socket.id);

        socket.on('examiner:join', () => {
            socket.join('examiners');
            console.log(`Socket ${socket.id} joined examiners room`);
        });

        socket.on('admin:join', () => {
            socket.join('admins');
            console.log(`Socket ${socket.id} joined admins room`);
        });

        socket.on('disconnect', () => {
            console.log('Socket Disconnected:', socket.id);
        });
    });
};

export const emitVerificationEvent = (event, data) => {
    if (io) {
        io.to('examiners').to('admins').emit(event, data);
    }
};

export const getIO = () => io;
