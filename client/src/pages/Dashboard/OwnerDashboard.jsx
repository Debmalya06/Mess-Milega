"use client"

import { useState, useEffect, useCallback } from "react"
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
  RefreshCw,
  AlertCircle,
  Loader2,
  Check,
  X,
  ChevronRight,
} from "lucide-react"
import { ownerService, propertyService, bookingService, paymentService } from "../../services/api"

const OwnerDashboard = () => {
  const { user } = useAuth()
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const [activeTab, setActiveTab] = useState("properties")
  
  // Dashboard data
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    monthlyRevenue: 0,
    pendingBookings: 0,
    pendingInquiries: 0,
    pendingVisits: 0,
    averageRating: 0,
  })

  // Tab-specific data
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [visits, setVisits] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Action loading states
  const [actionLoading, setActionLoading] = useState({})

  // Fetch dashboard summary
  const fetchDashboard = useCallback(async () => {
    try {
      setError(null)
      const response = await ownerService.getDashboard()
      const data = response.data
      
      // Update stats from dashboard response
      setStats({
        totalProperties: data.propertyStats?.totalProperties || 0,
        activeProperties: data.propertyStats?.activeProperties || 0,
        totalRooms: data.propertyStats?.totalRooms || 0,
        occupiedRooms: data.propertyStats?.occupiedRooms || 0,
        monthlyRevenue: data.paymentStats?.thisMonthRevenue || 0,
        pendingBookings: data.pendingBookings || 0,
        pendingInquiries: data.pendingInquiries || 0,
        pendingVisits: data.pendingVisitRequests || 0,
        averageRating: data.averageRating || 0,
      })
      
      // Set pending bookings list
      setPendingBookings(data.pendingBookingsList || [])
      
      // Set today's visits
      setVisits(data.todaysVisits || [])
      
      // Build recent activity from various sources
      const activities = []
      if (data.pendingBookingsList) {
        data.pendingBookingsList.slice(0, 3).forEach(booking => {
          activities.push({
            type: 'booking',
            message: `New booking request from ${booking.seekerName || 'Seeker'}`,
            time: booking.createdAt,
            color: 'green'
          })
        })
      }
      if (data.recentReviews) {
        data.recentReviews.slice(0, 3).forEach(review => {
          activities.push({
            type: 'review',
            message: `New review for ${review.propertyTitle || 'property'}`,
            time: review.createdAt,
            color: 'yellow'
          })
        })
      }
      setRecentActivity(activities.slice(0, 5))
      
    } catch (err) {
      console.error("Error fetching dashboard:", err)
      setError("Failed to load dashboard data")
    }
  }, [])

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    try {
      const response = await propertyService.getMyProperties()
      setProperties(response.data || [])
    } catch (err) {
      console.error("Error fetching properties:", err)
    }
  }, [])

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const response = await bookingService.getOwnerBookingRequests()
      setBookings(response.data || [])
    } catch (err) {
      console.error("Error fetching bookings:", err)
    }
  }, [])

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      const response = await ownerService.getInquiries()
      setInquiries(response.data || [])
    } catch (err) {
      console.error("Error fetching inquiries:", err)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      await Promise.all([
        fetchDashboard(),
        fetchProperties(),
        fetchBookings(),
      ])
      setLoading(false)
    }
    loadInitialData()
  }, [fetchDashboard, fetchProperties, fetchBookings])

  // Fetch tab-specific data
  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings()
    } else if (activeTab === "inquiries") {
      fetchInquiries()
    }
  }, [activeTab, fetchBookings, fetchInquiries])

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchDashboard(),
      fetchProperties(),
      fetchBookings(),
    ])
    setRefreshing(false)
  }

  // Confirm booking
  const handleConfirmBooking = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [`confirm-${bookingId}`]: true }))
    try {
      await bookingService.confirmBooking(bookingId)
      fetchBookings()
      fetchDashboard()
    } catch (err) {
      console.error("Error confirming booking:", err)
    } finally {
      setActionLoading(prev => ({ ...prev, [`confirm-${bookingId}`]: false }))
    }
  }

  // Reject booking
  const handleRejectBooking = async (bookingId) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return
    
    setActionLoading(prev => ({ ...prev, [`reject-${bookingId}`]: true }))
    try {
      await bookingService.rejectBooking(bookingId, reason)
      fetchBookings()
      fetchDashboard()
    } catch (err) {
      console.error("Error rejecting booking:", err)
    } finally {
      setActionLoading(prev => ({ ...prev, [`reject-${bookingId}`]: false }))
    }
  }

  // Delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return
    
    setActionLoading(prev => ({ ...prev, [`delete-${propertyId}`]: true }))
    try {
      await propertyService.deleteProperty(propertyId)
      fetchProperties()
      fetchDashboard()
    } catch (err) {
      console.error("Error deleting property:", err)
      alert("Failed to delete property. " + (err.response?.data?.message || ""))
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${propertyId}`]: false }))
    }
  }

  const occupancyRate = stats.totalRooms > 0 
    ? (stats.occupiedRooms / stats.totalRooms) * 100 
    : 0

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "INACTIVE":
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.fullName || user?.name || "Owner"}! Manage your properties and bookings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/add-property"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <button onClick={handleRefresh} className="ml-auto text-red-600 hover:text-red-800">
              Retry
            </button>
          </div>
        )}

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
                <p className="text-xs text-gray-500">{stats.activeProperties} active</p>
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
                <p className="text-xs text-gray-500">{stats.occupiedRooms}/{stats.totalRooms} rooms</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.monthlyRevenue >= 1000 ? `${(stats.monthlyRevenue / 1000).toFixed(0)}K` : stats.monthlyRevenue}
                </p>
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
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}</p>
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
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                  {[
                    { id: "properties", label: "My Properties", icon: <Home className="h-4 w-4" /> },
                    { id: "bookings", label: "Bookings", icon: <Calendar className="h-4 w-4" /> },
                    { id: "inquiries", label: "Inquiries", icon: <MessageCircle className="h-4 w-4" /> },
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
                    {properties.length === 0 ? (
                      <div className="text-center py-8">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
                        <p className="text-gray-600 mb-4">Add your first property to start receiving bookings</p>
                        <Link
                          to="/add-property"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Property
                        </Link>
                      </div>
                    ) : (
                      properties.map((property) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <img
                              src={property.images?.[0] || property.image || "/placeholder.svg?height=100&width=150"}
                              alt={property.title}
                              className="w-20 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                                  <p className="text-sm text-gray-600 truncate">
                                    {property.address?.fullAddress || property.location || `${property.address?.city || ""}`}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <span>
                                      Rooms: {property.totalRooms || 0} ({property.availableRooms || 0} available)
                                    </span>
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                      <span>
                                        {property.averageRating?.toFixed(1) || "New"} ({property.totalReviews || 0} reviews)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}
                                  >
                                    {property.status?.charAt(0).toUpperCase() + property.status?.slice(1).toLowerCase() || "Active"}
                                  </span>
                                  <div className="mt-2 text-lg font-bold text-blue-600">
                                    ₹{(property.monthlyRent || property.rent || 0).toLocaleString()}/month
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
                            <Link
                              to={`/edit-property/${property.id}`}
                              className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                            <button 
                              onClick={() => handleDeleteProperty(property.id)}
                              disabled={actionLoading[`delete-${property.id}`]}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading[`delete-${property.id}`] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking Requests</h3>
                        <p className="text-gray-600">You'll see booking requests here when seekers book your properties</p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.seekerName || "Seeker"}</h3>
                              <p className="text-sm text-gray-600">{booking.propertyTitle || "Property"}</p>
                              <div className="mt-2 text-sm text-gray-600 space-y-1">
                                <p>Check-in: {formatDate(booking.checkInDate)}</p>
                                <p>Duration: {booking.numberOfMonths || 1} month(s)</p>
                                {booking.seekerPhone && <p>Contact: {booking.seekerPhone}</p>}
                                {booking.seekerEmail && <p>Email: {booking.seekerEmail}</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                              >
                                {booking.status?.replace("_", " ")}
                              </span>
                              <div className="mt-2 text-lg font-bold text-blue-600">
                                ₹{(booking.monthlyRent || 0).toLocaleString()}/month
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              to={`/booking-details/${booking.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Details
                            </Link>
                            <Link to="/chat" className="text-green-600 hover:text-green-800 text-sm font-medium">
                              Contact Seeker
                            </Link>
                            {booking.status === "PENDING" && (
                              <>
                                <button 
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={actionLoading[`confirm-${booking.id}`]}
                                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                                >
                                  {actionLoading[`confirm-${booking.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectBooking(booking.id)}
                                  disabled={actionLoading[`reject-${booking.id}`]}
                                  className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                                >
                                  {actionLoading[`reject-${booking.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <X className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Inquiries Tab */}
                {activeTab === "inquiries" && (
                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiries Yet</h3>
                        <p className="text-gray-600">You'll receive inquiries when seekers have questions about your properties</p>
                      </div>
                    ) : (
                      inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {inquiry.subject || "Inquiry"}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                From: {inquiry.seekerName || "Seeker"} • {inquiry.propertyTitle || "Property"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!inquiry.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                inquiry.status === "OPEN" ? "bg-green-100 text-green-800" :
                                inquiry.status === "CLOSED" ? "bg-gray-100 text-gray-800" :
                                "bg-yellow-100 text-yellow-800"
                              }`}>
                                {inquiry.status}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 text-gray-700 text-sm line-clamp-2">{inquiry.message}</p>

                          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>{formatDate(inquiry.createdAt)}</span>
                            <span>{inquiry.replies?.length || 0} replies</span>
                          </div>

                          <div className="mt-4 flex gap-3">
                            <Link
                              to={`/inquiry/${inquiry.id}`}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                            <Link
                              to={`/property/${inquiry.propertyId}`}
                              className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              <Home className="h-4 w-4 mr-1" />
                              View Property
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
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
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.color === 'green' ? 'bg-green-500' :
                        activity.color === 'blue' ? 'bg-blue-500' :
                        activity.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Actions */}
            {(stats.pendingBookings > 0 || stats.pendingInquiries > 0 || stats.pendingVisits > 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-orange-900 mb-4">Pending Actions</h2>
                <div className="space-y-3">
                  {stats.pendingBookings > 0 && (
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="flex items-center justify-between w-full p-3 hover:bg-orange-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <span className="text-sm text-gray-900">{stats.pendingBookings} pending booking(s)</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                  {stats.pendingInquiries > 0 && (
                    <button
                      onClick={() => setActiveTab("inquiries")}
                      className="flex items-center justify-between w-full p-3 hover:bg-orange-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-orange-600" />
                        <span className="text-sm text-gray-900">{stats.pendingInquiries} pending inquiry(ies)</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                  {stats.pendingVisits > 0 && (
                    <div className="flex items-center space-x-3 p-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-gray-900">{stats.pendingVisits} pending visit request(s)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  <span className="font-bold">
                    ₹{stats.monthlyRevenue >= 1000 ? `${(stats.monthlyRevenue / 1000).toFixed(0)}K` : stats.monthlyRevenue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Occupancy Rate</span>
                  <span className="font-bold">{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Properties</span>
                  <span className="font-bold">{stats.activeProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rooms</span>
                  <span className="font-bold">{stats.totalRooms}</span>
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
