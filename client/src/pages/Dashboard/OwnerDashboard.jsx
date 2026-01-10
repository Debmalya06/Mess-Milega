"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import {
  Home,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  MessageCircle,
  Star,
  TrendingUp,
  BarChart3,
} from "lucide-react"

const OwnerDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("properties")
  const [stats, setStats] = useState({
    totalProperties: 5,
    occupiedRooms: 12,
    totalRooms: 15,
    monthlyRevenue: 180000,
    pendingBookings: 3,
  })

  // Mock data
  const [properties] = useState([
    {
      id: 1,
      title: "Comfortable PG in Koramangala",
      location: "Koramangala, Bangalore",
      type: "pg",
      totalRooms: 8,
      occupiedRooms: 6,
      rent: 12000,
      rating: 4.5,
      reviews: 28,
      image: "/placeholder.svg?height=100&width=150",
      status: "active",
    },
    {
      id: 2,
      title: "Ladies PG near Metro Station",
      location: "Indiranagar, Bangalore",
      type: "pg",
      totalRooms: 4,
      occupiedRooms: 4,
      rent: 13000,
      rating: 4.3,
      reviews: 15,
      image: "/placeholder.svg?height=100&width=150",
      status: "active",
    },
    {
      id: 3,
      title: "Shared Accommodation for IT Professionals",
      location: "Whitefield, Bangalore",
      type: "pg",
      totalRooms: 3,
      occupiedRooms: 2,
      rent: 15000,
      rating: 4.7,
      reviews: 22,
      image: "/placeholder.svg?height=100&width=150",
      status: "active",
    },
  ])

  const [bookings] = useState([
    {
      id: 1,
      tenant: {
        name: "Amit Kumar",
        phone: "+91 9876543210",
        email: "amit@example.com",
      },
      property: "Comfortable PG in Koramangala",
      moveInDate: "2024-02-01",
      rent: 12000,
      status: "pending",
      documents: ["id_proof", "address_proof", "photo"],
    },
    {
      id: 2,
      tenant: {
        name: "Priya Sharma",
        phone: "+91 9876543211",
        email: "priya@example.com",
      },
      property: "Ladies PG near Metro Station",
      moveInDate: "2024-01-15",
      rent: 13000,
      status: "confirmed",
      documents: ["id_proof", "address_proof", "photo"],
    },
  ])

  const occupancyRate = (stats.occupiedRooms / stats.totalRooms) * 100

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600">Manage your properties and bookings</p>
          </div>
          <Link
            to="/add-property"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.5</p>
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
                    { id: "properties", label: "My Properties", icon: <Home className="h-4 w-4" /> },
                    { id: "bookings", label: "Bookings", icon: <Calendar className="h-4 w-4" /> },
                    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
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
                {/* Properties Tab */}
                {activeTab === "properties" && (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={property.image || "/placeholder.svg"}
                            alt={property.title}
                            className="w-20 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{property.title}</h3>
                                <p className="text-sm text-gray-600">{property.location}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                  <span>
                                    Occupancy: {property.occupiedRooms}/{property.totalRooms}
                                  </span>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                    <span>
                                      {property.rating} ({property.reviews} reviews)
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}
                                >
                                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                </span>
                                <div className="mt-2 text-lg font-bold text-blue-600">
                                  ₹{property.rent.toLocaleString()}/month
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <Link
                            to={`/property/${property.id}`}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                          <button className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium">
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{booking.tenant.name}</h3>
                            <p className="text-sm text-gray-600">{booking.property}</p>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Move-in: {new Date(booking.moveInDate).toLocaleDateString()}</p>
                              <p>Contact: {booking.tenant.phone}</p>
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
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Documents
                          </button>
                          <Link to="/chat" className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Contact Tenant
                          </Link>
                          {booking.status === "pending" && (
                            <>
                              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                Approve
                              </button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                      <p className="text-gray-600">Detailed analytics and reports coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New booking request from Amit Kumar</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Payment received from Priya Sharma</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New review posted for Koramangala PG</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/add-property" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Plus className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Add New Property</span>
                </Link>
                <Link to="/chat" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">View Messages</span>
                </Link>
                <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg w-full text-left">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">This Month</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span className="font-bold">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy Rate</span>
                  <span className="font-bold">{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>New Bookings</span>
                  <span className="font-bold">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
