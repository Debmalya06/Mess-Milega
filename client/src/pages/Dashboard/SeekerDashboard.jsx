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
  Loader2,
  Search
} from "lucide-react"
import { seekerService, bookingService, paymentService, propertyService } from "../../services/api"

// ===================== DUMMY DATA FOR FALLBACK =====================
const DUMMY_BOOKINGS = [
  {
    id: "demo-booking-1",
    propertyId: "demo-prop-1",
    propertyTitle: "Cozy PG near Tech Park",
    propertyAddress: "Koramangala, Bangalore",
    propertyImage: "/placeholder.svg?height=100&width=150",
    status: "CONFIRMED",
    checkInDate: "2026-02-15",
    numberOfMonths: 6,
    monthlyRent: 12000,
    securityDeposit: 24000,
  },
  {
    id: "demo-booking-2",
    propertyId: "demo-prop-2",
    propertyTitle: "Modern Shared Room",
    propertyAddress: "Indiranagar, Bangalore",
    propertyImage: "/placeholder.svg?height=100&width=150",
    status: "PENDING",
    checkInDate: "2026-03-01",
    numberOfMonths: 12,
    monthlyRent: 15000,
    securityDeposit: 30000,
  },
]

const DUMMY_FAVORITES = [
  {
    id: "demo-fav-1",
    propertyId: "demo-prop-3",
    propertyTitle: "Spacious PG for Professionals",
    propertyCity: "Whitefield, Bangalore",
    propertyRent: 14000,
    propertyImage: "/placeholder.svg?height=150&width=300",
    property: {
      averageRating: 4.5,
    },
    note: "Close to office",
  },
  {
    id: "demo-fav-2",
    propertyId: "demo-prop-4",
    propertyTitle: "Ladies PG with All Amenities",
    propertyCity: "HSR Layout, Bangalore",
    propertyRent: 11000,
    propertyImage: "/placeholder.svg?height=150&width=300",
    property: {
      averageRating: 4.2,
    },
    note: "Good reviews",
  },
]

const DUMMY_PAYMENTS = [
  {
    id: "demo-pay-1",
    propertyTitle: "Cozy PG near Tech Park",
    paymentType: "MONTHLY_RENT",
    amount: 12000,
    dueDate: "2026-02-28",
    status: "PENDING",
  },
  {
    id: "demo-pay-2",
    propertyTitle: "Cozy PG near Tech Park",
    paymentType: "SECURITY_DEPOSIT",
    amount: 24000,
    dueDate: "2026-02-10",
    status: "PAID",
  },
]

const DUMMY_VISITS = [
  {
    id: "demo-visit-1",
    propertyId: "demo-prop-5",
    propertyTitle: "Premium PG in Electronic City",
    propertyAddress: "Electronic City Phase 1",
    visitDate: "2026-02-14",
    visitTime: "10:00 AM",
    status: "CONFIRMED",
    visitPurpose: "Property inspection",
  },
]

const DUMMY_INQUIRIES = [
  {
    id: "demo-inq-1",
    propertyId: "demo-prop-6",
    propertyTitle: "Budget PG near Metro",
    subject: "Availability Query",
    message: "Hi, I wanted to check if there are any rooms available for immediate move-in?",
    status: "OPEN",
    read: false,
    createdAt: new Date().toISOString(),
    replies: [
      { message: "Yes, we have 2 rooms available. Please visit for a tour." }
    ],
  },
]

const DUMMY_PROPERTIES = [
  {
    id: "demo-new-1",
    title: "Newly Listed: Modern Co-Living Space",
    address: { city: "Marathahalli, Bangalore", fullAddress: "Near Innovative Multiplex" },
    monthlyRent: 13500,
    images: ["/placeholder.svg?height=200&width=300"],
    averageRating: 4.7,
    totalReviews: 15,
    propertyType: "PG",
    roomType: "SHARED",
    amenities: ["WiFi", "AC", "Meals", "Laundry"],
  },
  {
    id: "demo-new-2",
    title: "Premium PG for Working Professionals",
    address: { city: "Sarjapur Road, Bangalore", fullAddress: "Near Wipro Campus" },
    monthlyRent: 16000,
    images: ["/placeholder.svg?height=200&width=300"],
    averageRating: 4.8,
    totalReviews: 22,
    propertyType: "PG",
    roomType: "SINGLE",
    amenities: ["WiFi", "AC", "Gym", "Power Backup"],
  },
  {
    id: "demo-new-3",
    title: "Affordable Mess near College",
    address: { city: "BTM Layout, Bangalore", fullAddress: "Near Christ University" },
    monthlyRent: 8500,
    images: ["/placeholder.svg?height=200&width=300"],
    averageRating: 4.3,
    totalReviews: 45,
    propertyType: "MESS",
    roomType: "SHARED",
    amenities: ["Meals", "WiFi", "Laundry"],
  },
]

const Dashboard = () => {
  const { user } = useAuth()
  
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [useDummyData, setUseDummyData] = useState(false)
  
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
  const [newProperties, setNewProperties] = useState([])
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)

  // Load dummy data as fallback
  const loadDummyData = useCallback(() => {
    setUseDummyData(true)
    setBookings(DUMMY_BOOKINGS)
    setFavorites(DUMMY_FAVORITES)
    setPayments(DUMMY_PAYMENTS)
    setVisits(DUMMY_VISITS)
    setInquiries(DUMMY_INQUIRIES)
    setNewProperties(DUMMY_PROPERTIES)
    setStats({
      totalBookings: DUMMY_BOOKINGS.length,
      activeBookings: DUMMY_BOOKINGS.filter(b => b.status === "CONFIRMED" || b.status === "ACTIVE").length,
      favorites: DUMMY_FAVORITES.length,
      pendingPayments: DUMMY_PAYMENTS.filter(p => p.status === "PENDING").length,
      upcomingVisits: DUMMY_VISITS.length,
      unreadInquiries: DUMMY_INQUIRIES.filter(i => !i.read).length,
    })
  }, [])

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
      return true
    } catch (err) {
      console.error("Error fetching dashboard:", err)
      return false
    }
  }, [])

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const response = await bookingService.getMyBookings()
      const bookingsList = response.data || []
      setBookings(bookingsList.length > 0 ? bookingsList : (useDummyData ? DUMMY_BOOKINGS : []))
      
      // Calculate booking stats
      const dataToUse = bookingsList.length > 0 ? bookingsList : (useDummyData ? DUMMY_BOOKINGS : [])
      const activeCount = dataToUse.filter(b => 
        b.status === "ACTIVE" || b.status === "CONFIRMED"
      ).length
      
      setStats(prev => ({
        ...prev,
        totalBookings: dataToUse.length,
        activeBookings: activeCount,
      }))
      return bookingsList.length > 0
    } catch (err) {
      console.error("Error fetching bookings:", err)
      if (useDummyData) {
        setBookings(DUMMY_BOOKINGS)
      }
      return false
    }
  }, [useDummyData])

  // Fetch all favorites
  const fetchAllFavorites = useCallback(async () => {
    try {
      const response = await seekerService.getFavorites()
      const favList = response.data || []
      setFavorites(favList.length > 0 ? favList : (useDummyData ? DUMMY_FAVORITES : []))
      setStats(prev => ({
        ...prev,
        favorites: favList.length > 0 ? favList.length : (useDummyData ? DUMMY_FAVORITES.length : 0),
      }))
    } catch (err) {
      console.error("Error fetching favorites:", err)
      if (useDummyData) {
        setFavorites(DUMMY_FAVORITES)
      }
    }
  }, [useDummyData])

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      const [allPayments, pendingPayments] = await Promise.all([
        paymentService.getMyPayments(),
        paymentService.getPendingPayments()
      ])
      const paymentsList = allPayments.data || []
      setPayments(paymentsList.length > 0 ? paymentsList : (useDummyData ? DUMMY_PAYMENTS : []))
      setStats(prev => ({
        ...prev,
        pendingPayments: pendingPayments.data?.length || (useDummyData ? 1 : 0),
      }))
    } catch (err) {
      console.error("Error fetching payments:", err)
      if (useDummyData) {
        setPayments(DUMMY_PAYMENTS)
      }
    }
  }, [useDummyData])

  // Fetch visits
  const fetchVisits = useCallback(async () => {
    try {
      const response = await seekerService.getUpcomingVisits()
      const visitsList = response.data || []
      setVisits(visitsList.length > 0 ? visitsList : (useDummyData ? DUMMY_VISITS : []))
      setStats(prev => ({
        ...prev,
        upcomingVisits: visitsList.length > 0 ? visitsList.length : (useDummyData ? DUMMY_VISITS.length : 0),
      }))
    } catch (err) {
      console.error("Error fetching visits:", err)
      if (useDummyData) {
        setVisits(DUMMY_VISITS)
      }
    }
  }, [useDummyData])

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      const response = await seekerService.getInquiries()
      const inquiriesList = response.data || []
      setInquiries(inquiriesList.length > 0 ? inquiriesList : (useDummyData ? DUMMY_INQUIRIES : []))
    } catch (err) {
      console.error("Error fetching inquiries:", err)
      if (useDummyData) {
        setInquiries(DUMMY_INQUIRIES)
      }
    }
  }, [useDummyData])

  // Fetch new properties
  const fetchNewProperties = useCallback(async () => {
    try {
      const response = await propertyService.searchProperties({})
      const propList = response.data || []
      setNewProperties(propList.length > 0 ? propList.slice(0, 6) : (useDummyData ? DUMMY_PROPERTIES : []))
    } catch (err) {
      console.error("Error fetching properties:", err)
      if (useDummyData) {
        setNewProperties(DUMMY_PROPERTIES)
      }
    }
  }, [useDummyData])

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      
      const results = await Promise.all([
        fetchDashboardData(),
        fetchBookings(),
        fetchPayments(),
      ])
      
      // If all API calls failed, load dummy data
      const allFailed = results.every(r => r === false)
      if (allFailed) {
        setError("Unable to connect to server. Showing demo data.")
        loadDummyData()
      }
      
      // Also fetch new properties
      await fetchNewProperties()
      
      setLoading(false)
    }
    loadInitialData()
  }, [fetchDashboardData, fetchBookings, fetchPayments, fetchNewProperties, loadDummyData])

  // Fetch tab-specific data on tab change
  useEffect(() => {
    if (activeTab === "favorites") {
      fetchAllFavorites()
    } else if (activeTab === "visits") {
      fetchVisits()
    } else if (activeTab === "inquiries") {
      fetchInquiries()
    } else if (activeTab === "explore") {
      fetchNewProperties()
    }
  }, [activeTab, fetchAllFavorites, fetchVisits, fetchInquiries, fetchNewProperties])

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true)
    setUseDummyData(false)
    setError(null)
    
    const results = await Promise.all([
      fetchDashboardData(),
      fetchBookings(),
      fetchPayments(),
      fetchNewProperties(),
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

        {/* Demo Data Banner */}
        {useDummyData && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Demo Mode Active</p>
                <p className="text-yellow-700 text-sm">Showing sample data. Connect to server for real data.</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh} 
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              Try Reconnect
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && !useDummyData && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={loadDummyData} 
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm"
              >
                Use Demo Data
              </button>
              <button 
                onClick={handleRefresh} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
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
                    { id: "explore", label: "Find Properties", icon: <Search className="h-4 w-4" /> },
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

                {/* Explore Properties Tab */}
                {activeTab === "explore" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {useDummyData ? "Featured Properties (Demo)" : "Available Properties"}
                      </h3>
                      <Link
                        to="/search"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    
                    {newProperties.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                        <p className="text-gray-600 mb-4">Check back later for new listings</p>
                        <Link
                          to="/search"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Search Properties
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newProperties.map((property) => (
                          <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <img
                              src={property.images?.[0] || "/placeholder.svg?height=150&width=300"}
                              alt={property.title}
                              className="w-full h-36 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-1 truncate">{property.title}</h4>
                              <div className="flex items-center text-gray-600 text-sm mb-2">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{property.address?.city || property.address?.fullAddress || "Location"}</span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-sm text-gray-600">
                                    {property.averageRating?.toFixed(1) || "New"} ({property.totalReviews || 0})
                                  </span>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {property.propertyType || "PG"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-blue-600">
                                  ₹{(property.monthlyRent || 0).toLocaleString()}/mo
                                </div>
                                <div className="flex space-x-2">
                                  <Link
                                    to={`/property/${property.id}`}
                                    className="bg-blue-600 text-white py-1.5 px-3 rounded-lg text-sm hover:bg-blue-700"
                                  >
                                    View
                                  </Link>
                                  <Link
                                    to={`/booking?propertyId=${property.id}`}
                                    className="border border-blue-600 text-blue-600 py-1.5 px-3 rounded-lg text-sm hover:bg-blue-50"
                                  >
                                    Book
                                  </Link>
                                </div>
                              </div>
                              {property.amenities && property.amenities.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {property.amenities.slice(0, 3).map((amenity, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                      {amenity}
                                    </span>
                                  ))}
                                  {property.amenities.length > 3 && (
                                    <span className="text-xs text-gray-500">+{property.amenities.length - 3} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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

            {/* Featured Properties */}
            {newProperties.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {useDummyData ? "Featured (Demo)" : "New Properties"}
                  </h2>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {newProperties.slice(0, 3).map((property) => (
                    <Link
                      key={property.id}
                      to={`/property/${property.id}`}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <img
                        src={property.images?.[0] || "/placeholder.svg?height=50&width=50"}
                        alt={property.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
                        <p className="text-xs text-gray-500">₹{(property.monthlyRent || 0).toLocaleString()}/mo</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
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
