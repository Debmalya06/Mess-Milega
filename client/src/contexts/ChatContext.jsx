"use client"

import { createContext, useContext, useState, useEffect } from "react"
import io from "socket.io-client"
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

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080")

      newSocket.emit("join", user.id)

      newSocket.on("message", (message) => {
        setMessages((prev) => [...prev, message])
      })

      newSocket.on("onlineUsers", (users) => {
        setOnlineUsers(users)
      })

      setSocket(newSocket)

      return () => newSocket.close()
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
