import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let socketInstance = null

export default function useSocket(onNotification) {
  const { user, isAuthenticated } = useAuthStore()
  const callbackRef = useRef(onNotification)
  callbackRef.current = onNotification

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Create single socket instance
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })
    }

    const socket = socketInstance

    socket.on('connect', () => {
      console.log('[socket] Connected')
      const userId = user?.id || user?._id
      if (userId) socket.emit('join', userId)
    })

    socket.on('notification', (data) => {
      console.log('[socket] New notification:', data.title)
      if (callbackRef.current) callbackRef.current(data)
    })

    socket.on('disconnect', () => {
      console.log('[socket] Disconnected')
    })

    // Join if already connected
    if (socket.connected) {
      const userId = user?.id || user?._id
      if (userId) socket.emit('join', userId)
    }

    return () => {
      socket.off('notification')
    }
  }, [isAuthenticated, user])

  const joinChama = (chamaId) => {
    if (socketInstance?.connected) {
      socketInstance.emit('join-chama', chamaId)
    }
  }

  return { joinChama }
}