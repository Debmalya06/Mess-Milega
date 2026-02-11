"use client"

import { createContext, useContext, useState, useEffect } from "react"
// import io from "socket.io-client"  // Disabled - Socket.IO server not implemented yet
import { useAuth } from "./AuthContext"

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [activeChats, setActiveChats] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user } = useAuth()

  // Socket.IO connection disabled - backend Socket.IO server not implemented yet
  // To enable real-time chat, you need to either:
  // 1. Add a separate Node.js Socket.IO server
  // 2. Add Spring WebSocket support to the backend
  useEffect(() => {
    if (user && import.meta.env.VITE_SOCKET_URL) {
      // Only connect if VITE_SOCKET_URL is explicitly set
      // This prevents connection attempts to non-existent Socket.IO server
      console.log("Chat: Socket.IO server URL not configured. Real-time chat disabled.")
    }
  }, [user])

  const sendMessage = (receiverId, message) => {
    if (socket) {
      const messageData = {
        senderId: user.id,
        receiverId,
        message,
        timestamp: new Date(),
      }
      socket.emit("sendMessage", messageData)
    }
  }

  const value = {
    socket,
    messages,
    activeChats,
    onlineUsers,
    sendMessage,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
