"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import { Home, Heart, MessageCircle, Calendar, CreditCard, Bell, Settings, Star, MapPin, Phone } from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("bookings")
  const [stats, setStats] = useState({
    totalBookings: 3,
    activeBookings: 1,
    favorites: 12,
    messages: 5,
  })

  // Mock data
  const [bookings] = useState([
    {
      id: 1,
      property: {
        title: "Comfortable PG in Koramangala",
        location: "Koramangala, Bangalore",
        image: "/placeholder.svg?height=100&width=150",
      },
      status: "active",
      moveInDate: "2024-01-15",
      rent: 12000,
      nextPayment: "2024-02-05",
    },
    {
      id: 2,
      property: {
        title: "Shared Accommodation near IT Park",
        location: "Whitefield, Bangalore",
        image: "/placeholder.svg?height=100&width=150",
      },
      status: "completed",
      moveInDate: "2023-06-01",
      moveOutDate: "2023-12-31",
      rent: 15000,
    },
  ])

  const [favorites] = useState([
    {
      id: 1,
      title: "Modern PG for Working Professionals",
      location: "HSR Layout, Bangalore",
      price: 14000,
      rating: 4.5,
      image: "/placeholder.svg?height=100&width=150",
    },
    {
      id: 2,
      title: "Ladies PG near Metro Station",
      location: "Indiranagar, Bangalore",
      price: 13000,
      rating: 4.3,
      image: "/placeholder.svg?height=100&width=150",
    },
  ])

  const [recentMessages] = useState([
    {
      id: 1,
      sender: "Rajesh Kumar",
      message: "The room is available from next month",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      sender: "Priya Sharma",
      message: "Can we schedule a visit tomorrow?",
      timestamp: "1 day ago",
      unread: false,
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName || user?.name}!</h1>
          <p className="text-gray-600">Manage your bookings and preferences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.messages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "bookings", label: "My Bookings", icon: <Home className="h-4 w-4" /> },
                    { id: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
                    { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={booking.property.image || "/placeholder.svg"}
                            alt={booking.property.title}
                            className="w-20 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{booking.property.title}</h3>
                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{booking.property.location}</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                  <p>Move-in: {new Date(booking.moveInDate).toLocaleDateString()}</p>
                                  {booking.moveOutDate && (
                                    <p>Move-out: {new Date(booking.moveOutDate).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                <div className="mt-2 text-lg font-bold text-blue-600">
                                  ₹{booking.rent.toLocaleString()}/month
                                </div>
                                {booking.nextPayment && (
                                  <div className="text-xs text-gray-500">
                                    Next payment: {new Date(booking.nextPayment).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <Link
                            to={`/property/${booking.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <Link to="/chat" className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Contact Owner
                          </Link>
                          {booking.status === "active" && (
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Favorites Tab */}
                {activeTab === "favorites" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{property.location}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-600">{property.rating}</span>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            ₹{property.price.toLocaleString()}/month
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-center text-sm hover:bg-blue-700"
                          >
                            View Details
                          </Link>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === "payments" && (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
                      <p className="text-gray-600">Your payment history will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Messages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                <Link to="/chat" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {message.sender.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900">{message.sender}</p>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.message}</p>
                      {message.unread && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/search" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Find New Properties</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Update Profile</span>
                </Link>
                <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg w-full text-left">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Notification Settings</span>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h2>
              <p className="text-sm text-blue-700 mb-4">
                Our support team is here to help you with any questions or issues.
              </p>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  <Phone className="h-4 w-4" />
                  <span>Call Support</span>
                </button>
                <Link
                  to="/chat"
                  className="flex items-center space-x-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Live Chat</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
