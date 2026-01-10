"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import { Send, Phone, Video, MoreVertical, Search, Paperclip, Smile } from "lucide-react"

const Chat = () => {
  const { user } = useAuth()
  const { messages, sendMessage, onlineUsers } = useChat()
  const [selectedChat, setSelectedChat] = useState(null)
  const [messageText, setMessageText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef(null)

  // Mock chat data
  const [chats] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      lastMessage: "The room is available from next month",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      avatar: "/placeholder.svg?height=40&width=40",
      propertyTitle: "Comfortable PG in Koramangala",
    },
    {
      id: 2,
      name: "Priya Sharma",
      lastMessage: "Can we schedule a visit tomorrow?",
      timestamp: "1 hour ago",
      unread: 0,
      online: false,
      avatar: "/placeholder.svg?height=40&width=40",
      propertyTitle: "Ladies PG near Metro Station",
    },
    {
      id: 3,
      name: "Amit Singh",
      lastMessage: "Thanks for the information",
      timestamp: "3 hours ago",
      unread: 1,
      online: true,
      avatar: "/placeholder.svg?height=40&width=40",
      propertyTitle: "Shared Accommodation for IT Professionals",
    },
  ])

  const [chatMessages] = useState({
    1: [
      {
        id: 1,
        senderId: 1,
        message: "Hi, I'm interested in your PG accommodation",
        timestamp: "10:30 AM",
        sent: false,
      },
      {
        id: 2,
        senderId: user?.id,
        message: "Hello! Thank you for your interest. The room is available from next month.",
        timestamp: "10:32 AM",
        sent: true,
      },
      {
        id: 3,
        senderId: 1,
        message: "What are the monthly charges including meals?",
        timestamp: "10:35 AM",
        sent: false,
      },
      {
        id: 4,
        senderId: user?.id,
        message: "The monthly rent is ₹12,000 including 3 meals a day, WiFi, and laundry service.",
        timestamp: "10:37 AM",
        sent: true,
      },
    ],
  })

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat, chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageText.trim() && selectedChat) {
      // In real app, this would use the sendMessage from context
      console.log("Sending message:", messageText)
      setMessageText("")
    }
  }

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Chat List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">{chat.propertyTitle}</p>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedChat.avatar || "/placeholder.svg"}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">{selectedChat.online ? "Online" : "Last seen 2 hours ago"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages[selectedChat.id]?.map((message) => (
                <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sent ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${message.sent ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
