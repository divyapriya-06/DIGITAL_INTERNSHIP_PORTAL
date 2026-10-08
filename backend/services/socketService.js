import { Server } from 'socket.io';
import Notification from '../models/Notification.js';

let ioInstance = null;

export const initSocketIO = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    // Join personal user room
    socket.on('joinUser', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join role room
    socket.on('joinRole', (role) => {
      if (role) {
        socket.join(`role_${role}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnect cleanly
    });
  });

  console.log('⚡ Socket.IO initialized successfully');
  return ioInstance;
};

export const getIO = () => ioInstance;

/**
 * Send real-time notification to a specific user and persist in database
 */
export const notifyUser = async (userId, { title, message, type = 'SYSTEM', link = '' }) => {
  try {
    // Persist in DB
    const notification = await Notification.create({
      recipient: userId,
      title,
      message,
      type,
      link,
    });

    // Emit live to socket room
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to dispatch notification:', error.message);
  }
};

/**
 * Broadcast event to all users in a specific role
 */
export const broadcastToRole = (role, event, data) => {
  if (ioInstance) {
    ioInstance.to(`role_${role}`).emit(event, data);
  }
};
