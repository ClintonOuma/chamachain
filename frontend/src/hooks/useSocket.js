import { useEffect } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const useSocket = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const userId = user._id || user.id;
    socket.emit('join', userId);

    socket.on('notification', (notification) => {
      console.log('New real-time notification:', notification);
      // You could trigger a toast or update global state here
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);
};

export default useSocket;
