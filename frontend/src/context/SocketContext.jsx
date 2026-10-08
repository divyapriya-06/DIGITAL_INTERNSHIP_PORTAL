import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Bell, CheckCircle2, AlertCircle, Calendar, Briefcase, X } from 'lucide-react';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, refreshProfile } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      // connected
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('joinUser', user._id);
      socket.emit('joinRole', user.role);

      // Listen for incoming notifications
      const handleNotification = (notif) => {
        addToast(notif);
        if (notif.type === 'VERIFICATION_UPDATE' && refreshProfile) {
          refreshProfile();
        }
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, user, refreshProfile]);

  const addToast = (notif) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...notif };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto remove after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'APPLICATION_UPDATE':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'INTERVIEW_SCHEDULED':
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      case 'NEW_APPLICATION':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'VERIFICATION_UPDATE':
        return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <SocketContext.Provider value={{ socket, addToast }}>
      {children}

      {/* Floating Real-time Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 transition-all duration-300 transform translate-y-0 hover:scale-[1.02]"
          >
            <div className="p-2 rounded-xl bg-slate-100/80 shrink-0">
              {getToastIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 leading-snug">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
