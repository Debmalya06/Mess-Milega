"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import {
  Home,
  Heart,
  MessageCircle,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  Star,
  MapPin,
  Phone,
  Clock,
  Eye,
  Send,
  X,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Loader2
} from "lucide-react"
import { seekerService, bookingService, paymentService } from "../../services/api"

const Dashboard = () => {
  const { user } = useAuth()
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Active tab
  const [activeTab, setActiveTab] = useState("bookings")
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    favorites: 0,
    pendingPayments: 0,
    upcomingVisits: 0,
    unreadInquiries: 0,
  })
  
  // Tab-specific data
  const [bookings, setBookings] = useState([])
  const [favorites, setFavorites] = useState([])
  const [payments, setPayments] = useState([])
  const [visits, setVisits] = useState([])
  const [inquiries, setInquiries] = useState([])
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)
      const response = await seekerService.getDashboard()
      setDashboardData(response.data)
      
      // Update stats from dashboard
      setStats(prev => ({
        ...prev,
        favorites: response.data.favoritesCount || 0,
        upcomingVisits: response.data.upcomingVisits?.length || 0,
        unreadInquiries: response.data.unreadInquiries || 0,
      }))
      
      // Set initial data
      setFavorites(response.data.recentFavorites || [])
      setVisits(response.data.upcomingVisits || [])
      setInquiries(response.data.recentInquiries || [])
    } catch (err) {
      console.error("Error fetching dashboard:", err)
      setError("Failed to load dashboard data")
    }
  }, [])

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const response = await bookingService.getMyBookings()
      const bookingsList = response.data || []
      setBookings(bookingsList)
      
      // Calculate booking stats
      const activeCount = bookingsList.filter(b => 
        b.status === "ACTIVE" || b.status === "CONFIRMED"
      ).length
      
      setStats(prev => ({
        ...prev,
        totalBookings: bookingsList.length,
        activeBookings: activeCount,
      }))
    } catch (err) {
      console.error("Error fetching bookings:", err)
    }
  }, [])

  // Fetch all favorites
  const fetchAllFavorites = useCallback(async () => {
    try {
      const response = await seekerService.getFavorites()
      setFavorites(response.data || [])
      setStats(prev => ({
        ...prev,
        favorites: response.data?.length || 0,
      }))
    } catch (err) {
      console.error("Error fetching favorites:", err)
    }
  }, [])

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      const [allPayments, pendingPayments] = await Promise.all([
        paymentService.getMyPayments(),
        paymentService.getPendingPayments()
      ])
      setPayments(allPayments.data || [])
      setStats(prev => ({
        ...prev,
        pendingPayments: pendingPayments.data?.length || 0,
      }))
    } catch (err) {
      console.error("Error fetching payments:", err)
    }
  }, [])

  // Fetch visits
  const fetchVisits = useCallback(async () => {
    try {
      const response = await seekerService.getUpcomingVisits()
      setVisits(response.data || [])
      setStats(prev => ({
        ...prev,
        upcomingVisits: response.data?.length || 0,
      }))
    } catch (err) {
      console.error("Error fetching visits:", err)
    }
  }, [])

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      const response = await seekerService.getInquiries()
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
        fetchDashboardData(),
        fetchBookings(),
        fetchPayments(),
      ])
      setLoading(false)
    }
    loadInitialData()
  }, [fetchDashboardData, fetchBookings, fetchPayments])

  // Fetch tab-specific data on tab change
  useEffect(() => {
    if (activeTab === "favorites") {
      fetchAllFavorites()
    } else if (activeTab === "visits") {
      fetchVisits()
    } else if (activeTab === "inquiries") {
      fetchInquiries()
    }
  }, [activeTab, fetchAllFavorites, fetchVisits, fetchInquiries])

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchDashboardData(),
      fetchBookings(),
      fetchPayments(),
    ])
    setRefreshing(false)
  }

  // Remove from favorites
  const handleRemoveFromFavorites = async (propertyId) => {
    try {
      await seekerService.removeFromFavorites(propertyId)
      setFavorites(prev => prev.filter(f => f.propertyId !== propertyId))
      setStats(prev => ({
        ...prev,
        favorites: prev.favorites - 1,
      }))
    } catch (err) {
      console.error("Error removing favorite:", err)
    }
  }

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return
    
    setCancelLoading(true)
    try {
      await bookingService.cancelBooking(selectedBooking.id, cancelReason)
      setShowCancelModal(false)
      setCancelReason("")
      setSelectedBooking(null)
      fetchBookings() // Refresh bookings
    } catch (err) {
      console.error("Error canceling booking:", err)
    } finally {
      setCancelLoading(false)
    }
  }

  // Cancel visit
  const handleCancelVisit = async (visitId, reason) => {
    try {
      await seekerService.cancelVisit(visitId, reason)
      fetchVisits()
    } catch (err) {
      console.error("Error canceling visit:", err)
    }
  }

  // Status color helpers
  const getBookingStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "DOCUMENTS_SUBMITTED":
        return "bg-blue-100 text-blue-800"
      case "PAYMENT_PENDING":
        return "bg-orange-100 text-orange-800"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800"
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "OVERDUE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVisitStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName || user?.name || "Seeker"}!
            </h1>
            <p className="text-gray-600">Manage your bookings, favorites, and preferences</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Total Bookings</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Active Bookings</p>
                <p className="text-xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Favorites</p>
                <p className="text-xl font-bold text-gray-900">{stats.favorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Pending Payments</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Upcoming Visits</p>
                <p className="text-xl font-bold text-gray-900">{stats.upcomingVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <MessageCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Unread Messages</p>
                <p className="text-xl font-bold text-gray-900">{stats.unreadInquiries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabs */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-4 px-4 min-w-max">
                  {[
                    { id: "bookings", label: "My Bookings", icon: <Home className="h-4 w-4" /> },
                    { id: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
                    { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
                    { id: "visits", label: "Visits", icon: <Calendar className="h-4 w-4" /> },
                    { id: "inquiries", label: "Inquiries", icon: <MessageCircle className="h-4 w-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-600 mb-4">Start exploring properties to book your perfect stay</p>
                        <Link
                          to="/search"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Find Properties
                        </Link>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <img
                              src={booking.propertyImage || booking.property?.images?.[0] || "/placeholder.svg?height=100&width=150"}
                              alt={booking.propertyTitle || "Property"}
                              className="w-24 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {booking.propertyTitle || "Property Booking"}
                                  </h3>
                                  <div className="flex items-center text-gray-600 text-sm mt-1">
                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="truncate">{booking.propertyAddress || "Address not available"}</span>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getBookingStatusColor(booking.status)}`}>
                                  {booking.status?.replace("_", " ")}
                                </span>
                              </div>
                              
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Check-in:</span> {formatDate(booking.checkInDate)}
                                </div>
                                <div>
                                  <span className="font-medium">Duration:</span> {booking.numberOfMonths || 1} month(s)
                                </div>
                                <div>
                                  <span className="font-medium">Rent:</span> ₹{(booking.monthlyRent || 0).toLocaleString()}/month
                                </div>
                                <div>
                                  <span className="font-medium">Deposit:</span> ₹{(booking.securityDeposit || 0).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                              to={`/property/${booking.propertyId}`}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Property
                            </Link>
                            <Link
                              to={`/booking-details/${booking.id}`}
                              className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Booking Details
                            </Link>
                            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowCancelModal(true)
                                }}
                                className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Favorites Tab */}
                {activeTab === "favorites" && (
                  <div className="space-y-4">
                    {favorites.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
                        <p className="text-gray-600 mb-4">Save properties you like to easily find them later</p>
                        <Link
                          to="/search"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Browse Properties
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((favorite) => (
                          <div key={favorite.id || favorite.propertyId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <img
                              src={favorite.property?.images?.[0] || favorite.propertyImage || "/placeholder.svg?height=150&width=300"}
                              alt={favorite.property?.title || "Property"}
                              className="w-full h-36 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                {favorite.property?.title || favorite.propertyTitle || "Property"}
                              </h3>
                              <div className="flex items-center text-gray-600 text-sm mb-2">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {favorite.property?.address?.city || favorite.propertyCity || "Location"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-sm text-gray-600">
                                    {favorite.property?.averageRating?.toFixed(1) || "New"}
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                  ₹{(favorite.property?.monthlyRent || favorite.propertyRent || 0).toLocaleString()}/mo
                                </div>
                              </div>
                              {favorite.note && (
                                <p className="text-xs text-gray-500 italic mb-3 truncate">Note: {favorite.note}</p>
                              )}
                              <div className="flex space-x-2">
                                <Link
                                  to={`/property/${favorite.propertyId}`}
                                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-center text-sm hover:bg-blue-700"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => handleRemoveFromFavorites(favorite.propertyId)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Remove from favorites"
                                >
                                  <Heart className="h-4 w-4 fill-current" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === "payments" && (
                  <div className="space-y-4">
                    {payments.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Yet</h3>
                        <p className="text-gray-600">Your payment history will appear here once you have bookings</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                                  {payment.propertyTitle || "Property"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {payment.paymentType?.replace("_", " ") || "Rent"}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  ₹{(payment.amount || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {formatDate(payment.dueDate)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                    {payment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Visits Tab */}
                {activeTab === "visits" && (
                  <div className="space-y-4">
                    {visits.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Visits</h3>
                        <p className="text-gray-600 mb-4">Schedule visits to properties you're interested in</p>
                        <Link
                          to="/search"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Find Properties
                        </Link>
                      </div>
                    ) : (
                      visits.map((visit) => (
                        <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {visit.propertyTitle || "Property Visit"}
                              </h3>
                              <div className="flex items-center text-gray-600 text-sm mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{visit.propertyAddress || "Address"}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitStatusColor(visit.status)}`}>
                              {visit.status}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(visit.visitDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{visit.visitTime || "Time TBD"}</span>
                            </div>
                            {visit.visitPurpose && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                <span>{visit.visitPurpose}</span>
                              </div>
                            )}
                          </div>

                          {visit.ownerNote && (
                            <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                              <span className="font-medium">Owner note:</span> {visit.ownerNote}
                            </div>
                          )}

                          {visit.status === "PENDING" || visit.status === "CONFIRMED" ? (
                            <div className="mt-4 flex gap-2">
                              <Link
                                to={`/property/${visit.propertyId}`}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Property
                              </Link>
                              <button
                                onClick={() => {
                                  const reason = prompt("Please provide a reason for cancellation:")
                                  if (reason) handleCancelVisit(visit.id, reason)
                                }}
                                className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel Visit
                              </button>
                            </div>
                          ) : null}
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
                        <p className="text-gray-600">Send inquiries to property owners to get more information</p>
                      </div>
                    ) : (
                      inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {inquiry.subject || "Inquiry"}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">
                                {inquiry.propertyTitle || "Property Inquiry"}
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
                            <span>{formatDateTime(inquiry.createdAt)}</span>
                            <span>{inquiry.replies?.length || 0} replies</span>
                          </div>

                          {inquiry.replies && inquiry.replies.length > 0 && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Latest reply:</span> {inquiry.replies[inquiry.replies.length - 1]?.message}
                            </div>
                          )}

                          <div className="mt-4 flex gap-2">
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
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Visits Summary */}
            {visits.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Visits</h2>
                  <button
                    onClick={() => setActiveTab("visits")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {visits.slice(0, 3).map((visit) => (
                    <div key={visit.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {visit.propertyTitle || "Property Visit"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(visit.visitDate)} at {visit.visitTime}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Inquiries */}
            {inquiries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
                  <button
                    onClick={() => setActiveTab("inquiries")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {inquiries.slice(0, 3).map((inquiry) => (
                    <div key={inquiry.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {inquiry.ownerName?.charAt(0) || "O"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 truncate">{inquiry.subject}</p>
                          {!inquiry.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{inquiry.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/search" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Find New Properties</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Link>
                <Link to="/profile" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Update Profile</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Link>
                <Link to="/preferences" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-900">Preferences & Alerts</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h2>
              <p className="text-sm text-blue-700 mb-4">
                Our support team is here to help you with any questions or issues.
              </p>
              <div className="flex flex-col space-y-2">
                <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  <Phone className="h-4 w-4" />
                  <span>Call Support</span>
                </button>
                <Link
                  to="/chat"
                  className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Live Chat</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                  setCancelReason("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your booking for{" "}
              <span className="font-medium">{selectedBooking?.propertyTitle}</span>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide a reason..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                  setCancelReason("")
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancelReason.trim() || cancelLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {cancelLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
