import logger from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Examiner joins examiner room
    socket.on('examiner:join', () => {
      socket.join('examiners');
      logger.info(`Examiner joined: ${socket.id}`);
    });

    // Admin joins admin room
    socket.on('admin:join', () => {
      socket.join('admins');
      logger.info(`Admin joined: ${socket.id}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

// Emit verification event to all examiners and admins
export const emitVerification = (io, type, data) => {
  io.to('examiners').emit(`verification:${type}`, data);
  io.to('admins').emit(`verification:${type}`, data);
};

// Emit payment event to admins
export const emitPayment = (io, data) => {
  io.to('admins').emit('payment:completed', data);
};
